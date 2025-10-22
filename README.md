# 🌱 Lingo Master - English Learning Platform

## 📋 **What is Lingo Master?**

**Lingo Master** is an English learning platform for Pakistani students with a plant-based gamification system. Students learn through 8 groups (0-7) with 370+ levels total.

### **Key Features:**
- 🌱 **Plant Growth System**: Watch your plant grow as you learn
- 📚 **8 Learning Groups**: From basic to master level
- 🎯 **6 Question Types**: MCQ, Text-to-Speech, Fill-in-blank, Synonyms, Antonyms, Sentence Completion
- 📊 **Progress Tracking**: Detailed analytics and achievements
- 🎨 **Modern UI**: Beautiful, responsive design

---

## 🏗️ **Tech Stack**

### **Backend:**
- Django 5.2.7 + Django REST Framework
- JWT Authentication
- SQLite (Dev) / PostgreSQL (Prod)
- Redis Caching

### **Frontend:**
- Next.js 14 + TypeScript
- Tailwind CSS
- Framer Motion
- Zustand State Management

---

## 🚀 **Quick Setup**

### **Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### **Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

---

## 📁 **Project Structure**

```
lingo-master/
├── backend/                 # Django backend
│   ├── users/              # User management
│   ├── groups/             # Learning groups
│   ├── levels/             # Levels & questions
│   ├── progress/           # Progress tracking
│   ├── plants/             # Plant growth system
│   ├── students/           # Student management
│   ├── teachers/           # Teacher management
│   ├── english_coordinator/ # English coordinator
│   └── manage.py
├── frontend/               # Next.js frontend
│   ├── src/app/           # Pages
│   ├── src/components/    # Components
│   └── package.json
└── README.md
```

---

## 🔌 **Main API Endpoints**

### **Learning API:**
```
GET  /api/learning/                    # Dashboard
GET  /api/learning/groups/             # User's groups
GET  /api/learning/groups/{id}/levels/ # Group levels
POST /api/learning/questions/submit-answer/ # Submit answers
GET  /api/learning/my-progress/       # User progress
```

### **Authentication:**
```
POST /api/users/auth/login/            # Login
POST /api/users/password-reset/request/ # Password reset
```

### **Admin APIs:**
```
/api/users/                   # User management
/api/students/                # Student management
/api/teachers/                # Teacher management
/api/english-coordinator/     # Coordinator management
```

---

## 👥 **User Roles**

### **🎓 Student:**
- Interactive lessons with 6 question types
- Plant growth system
- Progress tracking
- XP system and achievements

### **👨‍🏫 Teacher:**
- Class management
- Student monitoring
- Progress reports

### **👨‍💼 Admin:**
- Complete system management
- User and content management
- Analytics and reporting

### **🌍 English Coordinator:**
- Supervise English teachers
- Manage student progress
- Content management

---

## 🌱 **Plant Growth System**

**Growth Stages:**
1. 🌱 **Seed** (0-20%) - Starting journey
2. 🌿 **Sprout** (20-40%) - Early progress
3. 🌳 **Sapling** (40-60%) - Halfway there
4. 🌲 **Tree** (60-80%) - Almost there
5. 🍎 **Fruit Tree** (80-100%) - Group complete

---

## 🔒 **Security Features**

- ✅ **Password Hashing**: All passwords securely hashed
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Role-based Access**: Different permissions per role
- ✅ **Password Reset**: Email-based reset system
- ✅ **CORS Protection**: Cross-origin security

---

## 📊 **Current Status**

### **✅ Completed:**
- Backend API (90% complete)
- Database schema
- Authentication system
- Password security
- Plant growth system
- Progress tracking
- User management (Students, Teachers, Coordinators)

### **🔄 In Progress:**
- Frontend development (70% complete)
- Content creation (5% complete)

### **📋 Next:**
- Mobile responsiveness
- Content creation (1,200+ questions)
- Testing suite

---

## 🎯 **Key Statistics**

- **Total Groups:** 8 (0-7)
- **Total Levels:** 370+ (Group 0: 20, Groups 1-7: 50 each)
- **Total Questions:** 2,220+ (6 questions per level)
- **Question Types:** 6
- **Plant Stages:** 5
- **User Roles:** 4 (Admin, Teacher, Student, Coordinator)

---

## 📞 **Contact**

- **Email:** support@lingomaster.com
- **GitHub:** https://github.com/lingomaster

---

*Last Updated: October 2025*
*Version: 2.0.0*
*Backend Completion: 90%*
*Frontend Completion: 70%*