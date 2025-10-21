# 🌱 Lingo Master - English Learning Platform

## 📋 **Project Overview**

**Lingo Master** is a comprehensive English learning platform designed for Pakistani students, featuring a unique plant-based gamification system. The platform provides interactive lessons, progress tracking, and multi-role support with 8 learning groups (0-7) and 370+ levels total.

### **Key Features:**
- 🌱 **Plant Growth System**: Watch your plant grow from seed to fruit tree as you learn
- 📚 **8 Learning Groups**: From basic to master level (Group 0: 20 levels, Groups 1-7: 50 levels each)
- 🎯 **6 Question Types**: MCQ, Text-to-Speech, Fill-in-blank, Synonyms, Antonyms, Sentence Completion
- 🧪 **Group Jump Tests**: Pass 100% tests to unlock higher groups
- 📊 **Progress Tracking**: Detailed analytics and achievement system
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

---

## 🏗️ **Technical Architecture**

### **Backend Stack:**
- **Framework:** Django 5.2.7
- **API:** Django REST Framework (DRF)
- **Authentication:** JWT (Simple JWT)
- **Database:** SQLite (Development) / PostgreSQL (Production)
- **Caching:** Redis/Local Memory for performance optimization
- **File Storage:** Local (Development) / AWS S3 (Production)

### **Frontend Stack:**
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

### **Additional Tools:**
- **CORS:** django-cors-headers
- **Image Processing:** Pillow
- **Analytics:** Comprehensive user analytics system
- **Content Management:** Bulk import/export tools

---

## 📁 **Current Project Structure**

```
lingo-master/
├── backend/
│   ├── englishmaster/          # Django project settings
│   │   ├── settings.py         # Main configuration with caching
│   │   ├── urls.py            # Main URL routing
│   │   └── wsgi.py            # WSGI configuration
│   ├── users/                 # User management app
│   │   ├── models.py         # Custom User model with roles
│   │   ├── views.py          # Authentication & user management
│   │   ├── serializers.py    # User serializers
│   │   ├── urls.py           # User URL patterns
│   │   └── admin.py          # Admin interface
│   ├── groups/               # Learning groups app
│   │   ├── models.py         # Group & GroupProgress models
│   │   ├── views.py          # Group management views
│   │   ├── serializers.py    # Group serializers
│   │   ├── urls.py           # Group URL patterns
│   │   └── admin.py          # Admin interface
│   ├── levels/               # Level management app
│   │   ├── models.py         # Level, Question, LevelCompletion models
│   │   ├── views.py          # Level & question views
│   │   ├── serializers.py    # Level serializers
│   │   ├── urls.py           # Level URL patterns
│   │   └── admin.py          # Admin interface
│   ├── progress/             # Progress tracking app
│   │   ├── models.py         # LevelProgress, DailyProgress models
│   │   ├── views.py          # Progress tracking views
│   │   ├── serializers.py    # Progress serializers
│   │   ├── urls.py           # Progress URL patterns
│   │   └── admin.py          # Admin interface
│   ├── plants/               # Plant growth system app
│   │   ├── models.py         # PlantType, PlantStage, UserPlant models
│   │   ├── views.py          # Plant management views
│   │   ├── serializers.py    # Plant serializers
│   │   ├── urls.py           # Plant URL patterns
│   │   └── admin.py          # Admin interface
│   ├── students/             # Student management app
│   │   ├── models.py         # Student model
│   │   ├── views.py          # Student views
│   │   └── admin.py          # Admin interface
│   ├── teachers/             # Teacher management app
│   │   ├── models.py         # Teacher model
│   │   ├── views.py          # Teacher views
│   │   └── admin.py          # Admin interface
│   ├── campus/               # Campus management app
│   │   ├── models.py         # Campus model
│   │   └── admin.py          # Admin interface
│   ├── classes/              # Class management app
│   │   ├── models.py         # Grade, ClassRoom models
│   │   └── admin.py          # Admin interface
│   ├── tests/                # Test management app
│   │   ├── models.py         # Test models
│   │   └── admin.py          # Admin interface
│   ├── learning_api.py       # Unified Learning API
│   ├── analytics_api.py      # Comprehensive Analytics API
│   ├── cache_utils.py        # Caching utilities
│   ├── management/           # Management commands
│   │   └── commands/
│   │       ├── bulk_content.py    # Bulk import/export
│   │       ├── create_real_content.py # Content creation
│   │       ├── setup_groups.py    # Group setup
│   │       └── createuser.py      # User creation
│   ├── manage.py            # Django management script
│   ├── requirements.txt      # Python dependencies
│   └── db.sqlite3          # SQLite database
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── page.tsx     # Home page
│   │   │   ├── groups/      # Groups pages
│   │   │   ├── login/       # Login page
│   │   │   ├── register/    # Register page
│   │   │   ├── profile/     # Profile page
│   │   │   └── progress/    # Progress page
│   │   ├── components/      # Reusable components
│   │   │   ├── Navigation.tsx
│   │   │   ├── PlantGrowthSystem.tsx
│   │   │   ├── HeartsSystem.tsx
│   │   │   ├── StreakSystem.tsx
│   │   │   └── VoiceRecorder.tsx
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── services/        # API services
│   │   │   └── api.ts
│   │   └── utils/          # Utility functions
│   │       └── progressManager.ts
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind configuration
├── docs/                    # Project documentation
│   ├── API_STRUCTURE.md    # API documentation
│   ├── CONTENT_REQUIREMENTS.md # Content specifications
│   ├── TEAM_TASK_DIVISION.md   # Team responsibilities
│   └── USER_CREATION_GUIDE.md  # User management guide
└── README.md               # Project overview
```

---

## 🗄️ **Database Schema**

### **Core Models:**

#### **Users App:**
- **User** - Custom user model with roles (admin/teacher/student/donor)
- **LoginLog** - Login attempt tracking

#### **Groups App:**
- **Group** - Learning groups (0-7) with difficulty levels
- **GroupProgress** - User progress per group
- **GroupUnlockTest** - Tests to unlock higher groups
- **GroupUnlockTestAttempt** - User test attempts

#### **Levels App:**
- **Level** - Individual learning levels within groups
- **Question** - Questions with 6 types (MCQ, Text-to-Speech, etc.)
- **LevelCompletion** - User level completion records

#### **Progress App:**
- **LevelProgress** - Detailed level progress tracking
- **QuestionProgress** - Individual question progress
- **DailyProgress** - Daily learning activity

#### **Plants App:**
- **PlantType** - Different types of plants
- **PlantStage** - Growth stages (Seed → Sprout → Sapling → Tree → Fruit Tree)
- **UserPlant** - User's plant progress and health
- **PlantCareLog** - Plant care activity log

#### **Students/Teachers/Campus/Classes Apps:**
- **Student** - Student information and management
- **Teacher** - Teacher information and management
- **Campus** - School campus management
- **Grade** - Academic grades
- **ClassRoom** - Classroom management

---

## 🔌 **API Endpoints**

### **Unified Learning API (`/api/learning/`):**
```
GET  /api/learning/                    # Main learning dashboard
GET  /api/learning/groups/             # User's groups with progress
GET  /api/learning/groups/{id}/        # Group details
GET  /api/learning/groups/{id}/levels/ # Levels in a group
GET  /api/learning/groups/{id}/levels/{level_id}/ # Level details
GET  /api/learning/groups/{id}/levels/{level_id}/questions/ # Level questions
POST /api/learning/questions/submit-answer/ # Submit answers
POST /api/learning/groups/{id}/levels/{level_id}/complete/ # Complete level
GET  /api/learning/my-progress/       # User's progress
GET  /api/learning/my-stats/          # User statistics
GET  /api/learning/stats/             # Learning statistics
GET  /api/learning/recommendations/   # Personalized recommendations
GET  /api/learning/next-level/        # Next level to complete
GET  /api/learning/test-levels/       # Test levels
```

### **Analytics API (`/api/analytics/`):**
```
GET  /api/analytics/user/engagement/  # User engagement analytics
GET  /api/analytics/user/progress/    # Learning progress analytics
GET  /api/analytics/user/performance/ # Performance insights
GET  /api/analytics/user/export/      # Export user data
GET  /api/analytics/system/           # System analytics (admin)
```

### **Plant System API (`/api/learning/plant/`):**
```
GET  /api/learning/my-plant/          # User's plant
POST /api/learning/plant/create/       # Create plant
POST /api/learning/plant/care/         # Care for plant
GET  /api/learning/plant/stats/        # Plant statistics
POST /api/learning/plant/update-progress/ # Update plant progress
GET  /api/learning/plant/recommendations/ # Plant care recommendations
GET  /api/learning/plant/achievements/ # Plant achievements
```

### **Authentication:**
```
POST /api/auth/login/          # User login
POST /api/auth/refresh/       # Token refresh
```

### **Legacy APIs (Backward Compatibility):**
```
/api/users/                   # User management
/api/groups/                  # Group management
/api/levels/                  # Level management
/api/progress/                # Progress tracking
/api/plants/                   # Plant system
/api/students/                # Student management
/api/teachers/                # Teacher management
/api/campus/                  # Campus management
/api/classes/                 # Class management
```

---

## 🌱 **Plant Growth System**

### **Growth Stages:**
1. **🌱 Seed** (0-20% complete) - Starting the learning journey
2. **🌿 Sprout** (20-40% complete) - Early progress
3. **🌳 Sapling** (40-60% complete) - Halfway there
4. **🌲 Tree** (60-80% complete) - Almost there
5. **🍎 Fruit Tree** (80-100% complete) - Group complete

### **Plant Features:**
- **Health System**: Plants can wilt if not cared for daily
- **Care Streaks**: Daily care maintains plant health
- **Growth Rewards**: XP and achievements for plant growth
- **Visual Progress**: Plant growth reflects learning progress

---

## 👥 **User Roles & Features**

### **🎓 Student Features:**
- Interactive lessons with 6 question types
- Plant growth system with daily care
- Progress tracking and analytics
- Group jump tests for advancement
- XP system and achievements
- Daily learning streaks
- Personalized recommendations

### **👨‍🏫 Teacher Features:**
- Class management and student monitoring
- Progress reports and analytics
- Student performance insights
- Content creation tools
- Assessment and evaluation

### **👨‍💼 Admin Features:**
- Complete system management
- User and content management
- Analytics and reporting
- Bulk content import/export
- System configuration
- Security and access control

### **💰 Donor Features:**
- Impact tracking and reports
- Student success stories
- Financial transparency
- Community engagement

---

## 🚀 **Setup Instructions**

### **Backend Setup:**

1. **Install Python Dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Database Setup:**
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Create Sample Data:**
```bash
python manage.py setup_groups --reset
python manage.py create_real_content
```

4. **Create Users:**
```bash
python manage.py createuser --role admin --username admin --email admin@school.com --password admin123
python manage.py createuser --role student --username student123 --first-name John --last-name Doe
```

5. **Run Development Server:**
```bash
python manage.py runserver
```

### **Frontend Setup:**

1. **Install Dependencies:**
```bash
cd frontend
npm install
```

2. **Run Development Server:**
```bash
npm run dev
```

3. **Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

---

## 🔧 **Configuration**

### **Environment Variables:**
```env
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Cache Settings
CACHE_BACKEND=default  # or 'redis' for Redis caching
```

---

## 📊 **Key Features**

### **Learning System:**
- **8 Groups**: Progressive difficulty (Group 0: 20 levels, Groups 1-7: 50 levels each)
- **6 Question Types**: MCQ, Text-to-Speech, Fill-in-blank, Synonyms, Antonyms, Sentence Completion
- **Group Jump Tests**: 100% required to skip groups
- **Progress Tracking**: Real-time progress monitoring
- **Personalization**: Adaptive learning paths

### **Gamification:**
- **Plant Growth System**: Visual progress representation
- **XP System**: Points for completing activities
- **Streaks**: Daily learning streaks
- **Hearts System**: Lives for failed attempts
- **Achievements**: Recognition for milestones

### **Analytics:**
- **User Analytics**: Individual progress tracking
- **Performance Analytics**: Question type and difficulty analysis
- **Engagement Analytics**: Learning patterns and behavior
- **System Analytics**: Platform-wide insights
- **Export Functionality**: Complete user data export

---

## 🔒 **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions per role
- **CORS Protection**: Cross-origin request security
- **Input Validation**: API input sanitization
- **Rate Limiting**: API abuse prevention (planned)
- **Data Encryption**: Sensitive data protection

---

## 📱 **Mobile Support**

- **Responsive Design**: Works on all screen sizes
- **Progressive Web App**: Mobile app-like experience (planned)
- **Touch Optimization**: Mobile-friendly interactions
- **Offline Support**: Planned for future releases

---

## 🌍 **Localization**

- **Multi-language Support**: English interface
- **Cultural Context**: Pakistani cultural examples
- **Local Content**: Pakistan-specific vocabulary
- **Regional Examples**: Local business, education contexts

---

## 📈 **Performance Optimization**

- **Caching System**: Redis/Local memory caching
- **Database Indexing**: Optimized queries
- **API Optimization**: Response caching
- **CDN Ready**: Static file delivery preparation
- **Image Optimization**: Compressed media files

---

## 🧪 **Testing Strategy**

- **Unit Tests**: Individual component testing (planned)
- **Integration Tests**: API endpoint testing (planned)
- **End-to-End Tests**: Complete user journey testing (planned)
- **Performance Tests**: Load and stress testing (planned)

---

## 🚀 **Deployment**

### **Backend Deployment:**
- **Platform:** Heroku/AWS/DigitalOcean/Railway/Render
- **Database:** PostgreSQL
- **Static Files:** AWS S3/Cloudinary
- **Media Files:** AWS S3/Cloudinary
- **Environment:** Production settings

### **Frontend Deployment:**
- **Platform:** Vercel/Netlify
- **CDN:** Global content delivery
- **Environment:** Production build
- **Domain:** Custom domain setup

---

## 📞 **Support & Maintenance**

- **Documentation:** Comprehensive guides
- **Help Center:** FAQ and tutorials
- **Community Support:** User forums
- **Technical Support:** Direct assistance
- **Regular Updates:** Feature enhancements

---

## 🎯 **Current Status & Roadmap**

### **✅ Completed (Phase 1):**
- ✅ Backend API development (85% complete)
- ✅ Database schema design
- ✅ Authentication system
- ✅ Plant growth system
- ✅ Progress tracking
- ✅ Analytics system
- ✅ Caching system
- ✅ Bulk content management
- ✅ Frontend basic structure
- ✅ User management system

### **🔄 In Progress:**
- 🔄 Frontend development (70% complete)
- 🔄 Content creation (5% complete)
- 🔄 Testing suite (20% complete)

### **📋 Next Phase:**
- 📱 Mobile responsiveness
- 🤖 AI-powered recommendations
- 📊 Advanced analytics
- 🎮 Enhanced gamification
- 🧪 Comprehensive testing
- 📚 Content creation (1,200+ questions)

### **🎯 Future Phases:**
- 🌍 Multi-language support
- 📚 Content marketplace
- 👥 Social learning features
- 🔗 Third-party integrations

---

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 **Team Structure**

### **Backend Developer:**
- ✅ API development
- ✅ Database design
- ✅ Authentication system
- ✅ Analytics implementation
- ✅ Performance optimization

### **Frontend Developer:**
- 🔄 UI/UX development
- 🔄 Component creation
- 🔄 State management
- 🔄 API integration

### **Content Creator:**
- 📚 Question creation (1,200+ questions needed)
- 🎵 Audio content
- 🖼️ Visual assets
- 📖 Content validation

---

## 📧 **Contact**

- **Email:** support@lingomaster.com
- **Website:** https://lingomaster.com
- **GitHub:** https://github.com/lingomaster
- **Documentation:** https://docs.lingomaster.com

---

## 🏆 **Project Statistics**

- **Total Groups:** 8 (0-7)
- **Total Levels:** 370+ (Group 0: 20, Groups 1-7: 50 each)
- **Total Questions:** 2,220+ (6 questions per level)
- **Question Types:** 6 (MCQ, Text-to-Speech, Fill-in-blank, Synonyms, Antonyms, Sentence Completion)
- **Plant Stages:** 5 (Seed → Sprout → Sapling → Tree → Fruit Tree)
- **User Roles:** 4 (Admin, Teacher, Student, Donor)
- **API Endpoints:** 50+ (Unified Learning API + Analytics API)

---

*Last Updated: December 2024*
*Version: 2.0.0*
*Backend Completion: 85%*
*Frontend Completion: 70%*
*Overall Project Completion: 77%*