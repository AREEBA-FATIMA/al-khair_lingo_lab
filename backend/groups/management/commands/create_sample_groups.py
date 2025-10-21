from django.core.management.base import BaseCommand
from groups.models import Group


class Command(BaseCommand):
    help = 'Create sample groups for testing'

    def handle(self, *args, **options):
        # Sample groups data
        groups_data = [
            {
                'group_number': 0,
                'name': 'Basic English',
                'description': 'Basic level for complete beginners - Learn fundamental English words and phrases',
                'difficulty': 1,
                'is_unlocked': True,
                'unlock_condition': 'complete_previous',
                'xp_reward': 100,
                'badge_name': 'Beginner Badge',
                'badge_description': 'Completed Basic English group',
                'is_active': True
            },
            {
                'group_number': 1,
                'name': 'Elementary English',
                'description': 'Elementary level English learning - Build vocabulary and basic grammar',
                'difficulty': 2,
                'is_unlocked': True,
                'unlock_condition': 'complete_previous',
                'xp_reward': 150,
                'badge_name': 'Elementary Badge',
                'badge_description': 'Completed Elementary English group',
                'is_active': True
            },
            {
                'group_number': 2,
                'name': 'Pre-Intermediate',
                'description': 'Pre-intermediate level English - Expand vocabulary and improve grammar',
                'difficulty': 3,
                'is_unlocked': False,
                'unlock_condition': 'complete_previous',
                'xp_reward': 200,
                'badge_name': 'Pre-Intermediate Badge',
                'badge_description': 'Completed Pre-Intermediate group',
                'is_active': True
            },
            {
                'group_number': 3,
                'name': 'Intermediate',
                'description': 'Intermediate level English - Advanced vocabulary and complex grammar',
                'difficulty': 4,
                'is_unlocked': False,
                'unlock_condition': 'complete_previous',
                'xp_reward': 250,
                'badge_name': 'Intermediate Badge',
                'badge_description': 'Completed Intermediate group',
                'is_active': True
            },
            {
                'group_number': 4,
                'name': 'Upper-Intermediate',
                'description': 'Upper-intermediate level English - Professional vocabulary and advanced grammar',
                'difficulty': 5,
                'is_unlocked': False,
                'unlock_condition': 'complete_previous',
                'xp_reward': 300,
                'badge_name': 'Upper-Intermediate Badge',
                'badge_description': 'Completed Upper-Intermediate group',
                'is_active': True
            },
            {
                'group_number': 5,
                'name': 'Advanced',
                'description': 'Advanced level English - Expert vocabulary and complex grammar structures',
                'difficulty': 5,
                'is_unlocked': False,
                'unlock_condition': 'complete_previous',
                'xp_reward': 350,
                'badge_name': 'Advanced Badge',
                'badge_description': 'Completed Advanced group',
                'is_active': True
            },
            {
                'group_number': 6,
                'name': 'Expert',
                'description': 'Expert level English - Master vocabulary and advanced grammar',
                'difficulty': 5,
                'is_unlocked': False,
                'unlock_condition': 'complete_previous',
                'xp_reward': 400,
                'badge_name': 'Expert Badge',
                'badge_description': 'Completed Expert group',
                'is_active': True
            },
            {
                'group_number': 7,
                'name': 'Master',
                'description': 'Master level English - Native-level vocabulary and grammar mastery',
                'difficulty': 5,
                'is_unlocked': False,
                'unlock_condition': 'complete_previous',
                'xp_reward': 500,
                'badge_name': 'Master Badge',
                'badge_description': 'Completed Master group',
                'is_active': True
            }
        ]

        created_count = 0
        updated_count = 0

        for group_data in groups_data:
            group, created = Group.objects.get_or_create(
                group_number=group_data['group_number'],
                defaults=group_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created Group {group.group_number}: {group.name}')
                )
            else:
                # Update existing group
                for key, value in group_data.items():
                    setattr(group, key, value)
                group.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated Group {group.group_number}: {group.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary:\n'
                f'Created: {created_count} groups\n'
                f'Updated: {updated_count} groups\n'
                f'Total: {created_count + updated_count} groups processed'
            )
        )
