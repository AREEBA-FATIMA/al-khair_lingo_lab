# User Creation Guide

## ✅ **FIXED: Email Error Resolved!**

The `createsuperuser` command was causing email errors because it's designed for admin users only. Now we have a better solution.

## 🚀 **How to Create Users:**

### **1. Create Admin User:**
```bash
python manage.py createuser --role admin --username admin --email admin@school.com --first-name Admin --last-name User --password admin123
```

### **2. Create Teacher User:**
```bash
python manage.py createuser --role teacher --username teacher --email teacher@school.com --first-name Jane --last-name Smith --password teacher123
```

### **3. Create Student User:**
```bash
python manage.py createuser --role student --username student123 --first-name John --last-name Doe
```

## 🔐 **Login Methods:**

### **Students (4 ways - no password needed):**
- Student ID: `C08-M-G01-A-0007`
- First Name: `John`
- Last Name: `Doe`
- Username: `student123`

### **Teachers/Admins (email + password required):**
- Email: `teacher@school.com`
- Password: `teacher123`

## ✅ **Auto User Creation:**

When you create students or teachers through their respective models, User accounts are automatically created:

```python
# Student creation automatically creates User
student = Student(name='John Doe', grade='1', section='A', campus=campus)
student.save()  # User account created automatically

# Teacher creation automatically creates User  
teacher = Teacher(name='Jane Smith', email='jane@school.com', campus=campus)
teacher.save()  # User account created automatically
```

## 🎯 **Summary:**

- ✅ **No more email errors**
- ✅ **Flexible user creation**
- ✅ **Auto user creation**
- ✅ **Role-based authentication**
- ✅ **Multiple login methods for students**
