# Sample Questions Template for Import

## CSV Format Template
question_order,question_type,question_text,options,correct_answer,hint,explanation,difficulty,xp_value,time_limit_seconds,audio_url,image_url
1,mcq,"What is the capital of Pakistan?","Islamabad
Karachi
Lahore
Peshawar",Islamabad,"Think about the federal capital","Islamabad is the capital and seat of government of Pakistan",1,10,30,,
2,mcq,"Which is the largest city in Pakistan?","Karachi
Lahore
Islamabad
Faisalabad",Karachi,"Consider population size","Karachi is Pakistan's largest city by population",1,10,30,,
3,mcq,"What does 'Hello' mean in Urdu?","سلام
شکریہ
معاف کیجئے
الوداع",سلام,"Common greeting word","سلام means Hello in Urdu",1,10,30,,
4,fill_blank,"Complete: The cat is ___ the table.","on
in
at
under",on,"Think about position","'On' indicates position above something",1,15,45,,
5,mcq,"Which word means 'beautiful' in Urdu?","خوبصورت
بدصورت
بڑا
چھوٹا",خوبصورت,"Positive adjective","خوبصورت means beautiful in Urdu",2,15,30,,

## JSON Format Template
{
  "questions": [
    {
      "question_order": 1,
      "question_type": "mcq",
      "question_text": "What is the capital of Pakistan?",
      "options": "Islamabad\nKarachi\nLahore\nPeshawar",
      "correct_answer": "Islamabad",
      "hint": "Think about the federal capital",
      "explanation": "Islamabad is the capital and seat of government of Pakistan",
      "difficulty": 1,
      "xp_value": 10,
      "time_limit_seconds": 30,
      "audio_url": "",
      "image_url": ""
    },
    {
      "question_order": 2,
      "question_type": "mcq",
      "question_text": "Which is the largest city in Pakistan?",
      "options": "Karachi\nLahore\nIslamabad\nFaisalabad",
      "correct_answer": "Karachi",
      "hint": "Consider population size",
      "explanation": "Karachi is Pakistan's largest city by population",
      "difficulty": 1,
      "xp_value": 10,
      "time_limit_seconds": 30,
      "audio_url": "",
      "image_url": ""
    }
  ]
}

## Question Types Supported:
- mcq: Multiple Choice Questions
- fill_blank: Fill in the blank
- true_false: True/False questions
- matching: Matching questions
- audio: Audio-based questions

## Difficulty Levels:
- 1: Easy (10-15 XP)
- 2: Medium (15-25 XP)
- 3: Hard (25-50 XP)

## Time Limits:
- 0: No time limit
- 30: 30 seconds
- 60: 1 minute
- 120: 2 minutes
