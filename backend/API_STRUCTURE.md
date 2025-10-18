# 🎯 **NEW API STRUCTURE - Groups & Levels Integration**

## 📍 **Main Learning API** (`/api/learning/`)

### **Groups (Main Learning Units)**
```
GET  /api/learning/                    # List all groups
GET  /api/learning/{group_number}/     # Get specific group details
GET  /api/learning/my-groups/          # Get user's groups with progress
GET  /api/learning/stats/              # Get user's group statistics
GET  /api/learning/recommendations/    # Get group recommendations
```

### **Group Actions**
```
POST /api/learning/{group_id}/unlock/   # Unlock a group
POST /api/learning/{group_id}/complete/ # Complete a group
```

### **Levels Within Groups**
```
GET  /api/learning/{group_id}/levels/                    # Get all levels in a group
GET  /api/learning/{group_id}/levels/{level_number}/     # Get specific level in group
GET  /api/learning/{group_id}/levels/{level_number}/questions/  # Get level questions
POST /api/learning/{group_id}/levels/{level_number}/complete/   # Complete level
```

### **Questions**
```
GET  /api/learning/questions/{question_id}/     # Get question details
POST /api/learning/questions/submit-answer/     # Submit answer
```

### **User Progress**
```
GET  /api/learning/my-progress/                 # Get user's level completions
GET  /api/learning/my-progress/{completion_id}/ # Get specific completion
GET  /api/learning/my-stats/                    # Get user's level statistics
GET  /api/learning/next-level/                  # Get next level for user
GET  /api/learning/test-levels/                 # Get test levels
```

### **Unlock Tests**
```
GET  /api/learning/unlock-tests/                    # List unlock tests
GET  /api/learning/unlock-tests/{test_id}/          # Get test details
POST /api/learning/unlock-tests/{test_id}/start/    # Start unlock test
POST /api/learning/unlock-tests/{test_id}/submit/   # Submit test answers
GET  /api/learning/unlock-attempts/                 # Get user's test attempts
```

---

## 🔧 **Admin/Management API** (`/api/levels/`)

### **Level Management**
```
GET  /api/levels/admin/levels/                           # List all levels (admin)
GET  /api/levels/admin/levels/{level_number}/            # Get level details (admin)
GET  /api/levels/admin/levels/{level_number}/questions/  # Get level questions (admin)
```

### **Question Management**
```
GET  /api/levels/admin/questions/{question_id}/  # Get question details (admin)
```

### **User Progress Management**
```
GET  /api/levels/admin/completions/              # List all completions (admin)
GET  /api/levels/admin/completions/{completion_id}/  # Get completion details (admin)
GET  /api/levels/admin/stats/                    # Get system statistics (admin)
```

### **Admin ViewSets**
```
# Full CRUD operations for admin users
/api/levels/admin/levels/          # LevelViewSet
/api/levels/admin/questions/       # QuestionViewSet
```

---

## 🔄 **API Flow Examples**

### **1. User Learning Flow**
```bash
# 1. Get available groups
GET /api/learning/my-groups/

# 2. Get levels in a group
GET /api/learning/1/levels/

# 3. Get specific level
GET /api/learning/1/levels/1/

# 4. Get level questions
GET /api/learning/1/levels/1/questions/

# 5. Submit answer
POST /api/learning/questions/submit-answer/

# 6. Complete level
POST /api/learning/1/levels/1/complete/

# 7. Complete group
POST /api/learning/1/complete/
```

### **2. Admin Management Flow**
```bash
# 1. Create/Manage levels
POST /api/levels/admin/levels/

# 2. Create/Manage questions
POST /api/levels/admin/questions/

# 3. View user progress
GET /api/levels/admin/completions/

# 4. View system stats
GET /api/levels/admin/stats/
```

---

## 🎯 **Key Benefits**

### **✅ Better Organization**
- **Groups** are the main entry point for learning
- **Levels** are accessed through groups (not standalone)
- **Clear hierarchy**: Groups → Levels → Questions

### **✅ Cleaner URLs**
- `/api/learning/` - Main learning API
- `/api/levels/` - Admin/management only
- No more confusing separate level endpoints

### **✅ Better User Experience**
- Users start with groups, not levels
- Progress is tracked per group
- Unlock system is group-based

### **✅ Admin Separation**
- Admin functions are clearly separated
- Management tools are in `/api/levels/`
- Learning tools are in `/api/learning/`

---

## 📊 **Response Examples**

### **Group with Levels**
```json
{
  "group": {
    "id": 1,
    "name": "Basic English",
    "group_number": 1,
    "difficulty": 1,
    "description": "Learn basic English vocabulary"
  },
  "levels": [
    {
      "id": 1,
      "level_number": 1,
      "name": "Level 1",
      "difficulty": 1,
      "is_test_level": false,
      "xp_reward": 10
    }
  ],
  "total_levels": 10
}
```

### **User Groups with Progress**
```json
[
  {
    "id": 1,
    "name": "Basic English",
    "group_number": 1,
    "difficulty": 1,
    "progress": {
      "is_unlocked": true,
      "is_completed": false,
      "completion_percentage": 60.0,
      "levels_completed": 6,
      "total_xp_earned": 60
    }
  }
]
```

---

## 🚀 **Migration Notes**

- **Old URLs** still work for backward compatibility
- **New structure** is recommended for all new development
- **Admin functions** moved to `/api/levels/` for better organization
- **Learning functions** consolidated under `/api/learning/`
