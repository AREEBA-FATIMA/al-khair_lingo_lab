#!/usr/bin/env python
"""
Auto-run script to populate Campus data from Google Form responses
This script will automatically create campuses without asking for confirmation
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'englishmaster.settings')
django.setup()

from campus.models import Campus

# Google Form data extracted from the spreadsheet
CAMPUS_DATA = [
    {
        'campus_name': 'Campus 1',
        'campus_code': 'C01',
        'address': 'W-54sector 5/j Mustafa colony',
        'city': 'Karachi',
        'phone': '03160120857',
        'email': 'campus1@example.com',
        'head_name': 'Ms Yasmeen Shahid',
        'campus_type': 'main',
        'status': 'active'
    },
    {
        'campus_name': 'Campus 2',
        'campus_code': 'C02',
        'address': 'Kachra Kundi Jam Chakaro Goth',
        'city': 'Karachi',
        'phone': '03453132052',
        'email': 'campus2@example.com',
        'head_name': 'Sir Ashraf',
        'campus_type': 'main',
        'status': 'active'
    },
    {
        'campus_name': 'Campus 3',
        'campus_code': 'C03',
        'address': 'Wanghi GOTH',
        'city': 'Karachi',
        'phone': '03463315806',
        'email': 'aly.monsoori82@gmail.com',
        'head_name': 'Sir Ali',
        'campus_type': 'main',
        'status': 'active'
    },
    {
        'campus_name': 'Campus 4',
        'campus_code': 'C04',
        'address': 'Gul Muhammad Goth',
        'city': 'Karachi',
        'phone': '03402220105',
        'email': 'safiazaidisafii@gmail.com',
        'head_name': 'Miss Safia zaidi',
        'campus_type': 'main',
        'status': 'active'
    },
    {
        'campus_name': 'Campus 5',
        'campus_code': 'C05',
        'address': 'Noori Hotel, Gul Muhammad Goth Mangopir',
        'city': 'Karachi',
        'phone': '000-000-0000',
        'email': 'campus5@example.com',
        'head_name': 'Ms Anjum Khan',
        'campus_type': 'main',
        'status': 'active'
    },
    {
        'campus_name': 'Campus 6',
        'campus_code': 'C06',
        'address': 'Plot no A1 91,92,103 and 104 yaro goth Karachi',
        'city': 'Karachi',
        'phone': '03142777667',
        'email': 'shahidakanwaljamshaid@gmail.com',
        'head_name': 'Kashif Quraishi',
        'campus_type': 'main',
        'status': 'active'
    },
    {
        'campus_name': 'Campus 8',
        'campus_code': 'C08',
        'address': 'Wangji goth',
        'city': 'Karachi',
        'phone': '03132260512',
        'email': 'asimbashir036@gmail.com',
        'head_name': 'Fozia Sultana',
        'campus_type': 'main',
        'status': 'active'
    }
]

def populate_campuses():
    """Create campuses from Google Form data"""
    print("Starting campus population from Google Form data...")
    print("=" * 60)
    
    created_count = 0
    updated_count = 0
    
    for campus_info in CAMPUS_DATA:
        campus_code = campus_info['campus_code']
        campus_name = campus_info['campus_name']
        
        # Check if campus already exists
        campus, created = Campus.objects.get_or_create(
            campus_code=campus_code,
            defaults=campus_info
        )
        
        if created:
            print(f"Created: {campus_name} ({campus_code})")
            print(f"   Address: {campus_info['address']}")
            print(f"   Head: {campus_info['head_name']}")
            print(f"   Phone: {campus_info['phone']}")
            print(f"   Email: {campus_info['email']}")
            created_count += 1
        else:
            print(f"Already exists: {campus_name} ({campus_code})")
            updated_count += 1
        
        print("-" * 40)
    
    print("=" * 60)
    print(f"Summary:")
    print(f"   Created: {created_count} campuses")
    print(f"   Already existed: {updated_count} campuses")
    print(f"   Total campuses: {Campus.objects.count()}")
    print("=" * 60)
    print("Campus population completed successfully!")

if __name__ == '__main__':
    print("Auto Campus Population Script")
    print("=" * 60)
    
    # Automatically populate campuses
    populate_campuses()
    
    print("\nScript completed!")
