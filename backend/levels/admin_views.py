from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db import models
import json
import csv
import io
from levels.models import Level, Question
from levels.serializers import QuestionSerializer


def is_admin_user(user):
    return user.is_authenticated and (user.role == 'admin' or user.is_staff)


@login_required
@user_passes_test(is_admin_user)
def admin_dashboard_stats(request):
    """Get statistics for admin dashboard"""
    try:
        # Level statistics
        levels = Level.objects.all()
        level_stats = []
        
        for level in levels:
            questions = Question.objects.filter(level=level)
            level_stats.append({
                'id': level.id,
                'level_number': level.level_number,
                'name': level.name,
                'question_count': questions.count(),
                'active_question_count': questions.filter(is_active=True).count(),
                'difficulty': level.difficulty
            })
        
        # Question statistics
        total_questions = Question.objects.count()
        active_questions = Question.objects.filter(is_active=True).count()
        
        # Question type distribution
        question_types = Question.objects.values('question_type').annotate(
            count=models.Count('id')
        ).order_by('-count')
        
        # Question difficulty distribution
        question_difficulties = Question.objects.values('difficulty').annotate(
            count=models.Count('id')
        ).order_by('difficulty')
        
        return JsonResponse({
            'total_levels': levels.count(),
            'total_questions': total_questions,
            'active_questions': active_questions,
            'level_stats': level_stats,
            'question_stats': {
                'total': total_questions,
                'active': active_questions,
                'by_type': list(question_types),
                'by_difficulty': list(question_difficulties)
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@user_passes_test(is_admin_user)
def bulk_import_questions(request):
    """Bulk import questions from CSV/JSON file"""
    try:
        uploaded_file = request.FILES.get('questions_file')
        level_id = request.POST.get('level_id')
        file_format = request.POST.get('file_format', 'csv')
        
        if not uploaded_file or not level_id:
            return JsonResponse({
                'success': False,
                'message': 'File and level_id are required'
            }, status=400)
        
        try:
            level = Level.objects.get(id=level_id)
        except Level.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Level not found'
            }, status=400)
        
        imported_count = 0
        errors = []
        
        # Read file content
        file_content = uploaded_file.read().decode('utf-8')
        
        if file_format == 'csv':
            questions_data = parse_csv_content(file_content)
        else:
            questions_data = parse_json_content(file_content)
        
        # Import questions
        for i, question_data in enumerate(questions_data):
            try:
                question = Question.objects.create(
                    level=level,
                    question_order=question_data.get('question_order', 1),
                    question_type=question_data.get('question_type', 'mcq'),
                    question_text=question_data['question_text'],
                    options=question_data.get('options', ''),
                    correct_answer=question_data['correct_answer'],
                    hint=question_data.get('hint', ''),
                    explanation=question_data.get('explanation', ''),
                    difficulty=question_data.get('difficulty', 1),
                    xp_value=question_data.get('xp_value', 10),
                    time_limit_seconds=question_data.get('time_limit_seconds', 0),
                    audio_url=question_data.get('audio_url', ''),
                    image_url=question_data.get('image_url', ''),
                    is_active=True
                )
                imported_count += 1
            except Exception as e:
                errors.append(f'Row {i+1}: {str(e)}')
        
        return JsonResponse({
            'success': True,
            'message': f'Successfully imported {imported_count} questions',
            'imported_count': imported_count,
            'errors': errors
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Import failed: {str(e)}'
        }, status=500)


def parse_csv_content(content):
    """Parse CSV content and return list of question dictionaries"""
    questions = []
    csv_reader = csv.DictReader(io.StringIO(content))
    
    for row in csv_reader:
        question_data = {
            'question_order': int(row.get('question_order', 1)),
            'question_type': row.get('question_type', 'mcq'),
            'question_text': row['question_text'].strip(),
            'options': row.get('options', '').strip(),
            'correct_answer': row['correct_answer'].strip(),
            'hint': row.get('hint', '').strip(),
            'explanation': row.get('explanation', '').strip(),
            'difficulty': int(row.get('difficulty', 1)),
            'xp_value': int(row.get('xp_value', 10)),
            'time_limit_seconds': int(row.get('time_limit_seconds', 0)),
            'audio_url': row.get('audio_url', '').strip(),
            'image_url': row.get('image_url', '').strip(),
        }
        questions.append(question_data)
    
    return questions


def parse_json_content(content):
    """Parse JSON content and return list of question dictionaries"""
    data = json.loads(content)
    
    if isinstance(data, list):
        return data
    elif isinstance(data, dict) and 'questions' in data:
        return data['questions']
    else:
        raise ValueError('JSON file must contain a list of questions or an object with "questions" key')


@login_required
@user_passes_test(is_admin_user)
def question_list_admin(request):
    """Get all questions for admin management"""
    try:
        questions = Question.objects.select_related('level').all().order_by('level', 'question_order')
        serializer = QuestionSerializer(questions, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@user_passes_test(is_admin_user)
def create_question_admin(request):
    """Create a new question via admin panel"""
    try:
        data = json.loads(request.body)
        serializer = QuestionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@user_passes_test(is_admin_user)
def update_question_admin(request, question_id):
    """Update a question via admin panel"""
    try:
        question = Question.objects.get(id=question_id)
        data = json.loads(request.body)
        serializer = QuestionSerializer(question, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@user_passes_test(is_admin_user)
def delete_question_admin(request, question_id):
    """Delete a question via admin panel"""
    try:
        question = Question.objects.get(id=question_id)
        question.delete()
        return JsonResponse({'message': 'Question deleted successfully'})
    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
