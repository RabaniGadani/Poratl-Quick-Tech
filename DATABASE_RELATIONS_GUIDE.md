# QuickTech Database Relations & Auto-Population Guide

## 📊 Database Relationship Overview

```
auth.users (Supabase Auth)
    │
    ├──► profiles (id → auth.users.id)
    │       └── Auto-synced from students table
    │
    └──► students (user_id → auth.users.id)
            │
            ├──► courses (course_id → courses.id)
            │
            ├──► enrollments (student_id → students.id)
            │       │
            │       └──► semesters (semester_id → semesters.id)
            │               │
            │               └──► courses (course_id → courses.id)
            │
            ├──► results (student_id → students.id)
            │       │
            │       └──► semesters (semester_id → semesters.id)
```

## 🔄 Automatic Data Population Flow

### 1. **Student Creation/Update → Profile Sync**
**Trigger:** `trigger_sync_profile_on_student_insert` & `trigger_sync_profile_on_student_update`

When a student is created or updated:
- ✅ Automatically creates/updates corresponding entry in `profiles` table
- ✅ Syncs: `full_name`, `avatar_url`, `role` (always 'student')
- ✅ Uses `user_id` as the profile `id`

**Example:**
```sql
INSERT INTO students (user_id, full_name, avatar, course_id, ...)
VALUES ('user-123', 'John Doe', 'avatar.jpg', 'course-1', ...);
-- Automatically creates profile entry
```

---

### 2. **Enrollment Creation → Result Entry**
**Trigger:** `trigger_create_result_on_enrollment`

When an enrollment is created:
- ✅ Automatically creates a corresponding entry in `results` table
- ✅ Links student to semester result
- ✅ Pre-fills semester name, status, and basic info
- ✅ Marks will be NULL initially (to be filled later)

**Example:**
```sql
INSERT INTO enrollments (student_id, semester_id)
VALUES ('student-123', 'semester-456');
-- Automatically creates result entry for this student + semester
```

---

## 📋 Complete Table Relations

### **Core Tables**

1. **courses**
   - Primary Key: `id`
   - Related: `students`, `semesters`

2. **students** ⭐ *Central Hub*
   - Primary Key: `id`
   - Foreign Keys:
     - `user_id` → `auth.users.id`
     - `course_id` → `courses.id`
   - Auto-populates: `profiles`
   - Related to: `enrollments`, `results`

3. **semesters**
   - Primary Key: `id`
   - Foreign Keys:
     - `course_id` → `courses.id`
   - Related: `enrollments`, `results`

4. **enrollments** ⭐ *Junction Table*
   - Primary Key: `id`
   - Foreign Keys:
     - `student_id` → `students.id`
     - `semester_id` → `semesters.id`
   - Unique Constraint: `(student_id, semester_id)` - prevents duplicate enrollments
   - Auto-creates: `results` entries

5. **results**
   - Primary Key: `id`
   - Foreign Keys:
     - `student_id` → `students.id`
     - `semester_id` → `semesters.id`
   - Auto-created when: enrollment is created

6. **profiles**
   - Primary Key: `id` (matches `auth.users.id`)
   - Foreign Keys:
     - `id` → `auth.users.id`
   - Auto-synced from: `students` table

7. **lectures**
   - Foreign Keys:
     - `user_id` → `auth.users.id`

8. **messages**
   - No foreign keys (standalone chat system)

---

## 🎯 Data Flow Scenarios

### **Scenario 1: New Student Registration**
```
1. User registers → auth.users entry created
2. Student record created in students table
   └──► Profile automatically created in profiles table
```

### **Scenario 2: Student Enrollment**
```
1. Enrollment created (student + semester)
   └──► Result entry automatically created
   └──► Ready for marks/grades to be added later
```

### **Scenario 3: Semester + Student Creation**
```
1. Semester created with course_id, batch, course_name
2. Students with matching course_id and batch exist
   └──► (Optional: Auto-enrollment can be enabled via trigger)
```

### **Scenario 4: Student Data Update**
```
1. Student profile updated (name, course, etc.)
   └──► Profile table automatically updated
```

---

## 🔍 Performance Indexes Created

All frequently queried columns now have indexes:

- `idx_students_user_id` - Fast user lookups
- `idx_students_course_id` - Course-based queries
- `idx_students_batch` - Batch filtering
- `idx_students_course` - Course name searches
- `idx_enrollments_student_id` - Student enrollment queries
- `idx_enrollments_semester_id` - Semester enrollment queries
- `idx_results_student_id` - Student result queries
- `idx_results_semester_id` - Semester result queries
- `idx_semesters_course_id` - Course semester queries
- `idx_semesters_batch` - Batch semester queries
- `idx_profiles_id` - Profile lookups
- `idx_enrollments_unique_student_semester` - Prevents duplicate enrollments

---

## ✅ Verification Summary

**Setup Status:**
- ✅ **7 Foreign Keys** configured
- ✅ **4 Triggers** active for auto-population
- ✅ **23 Indexes** for optimal performance
- ✅ **Cascading deletes** where appropriate
- ✅ **Unique constraints** to prevent duplicates

**Automatic Behaviors:**
- ✅ Student → Profile sync
- ✅ Enrollment → Result creation
- ✅ Data consistency maintained across all tables

---

## 🚀 Usage Examples

### Creating a Complete Student Record Flow:

```sql
-- 1. Create student (profile auto-created)
INSERT INTO students (user_id, full_name, course_id, batch, course, ...)
VALUES ('user-123', 'John Doe', 'course-1', '2024', 'IT Diploma', ...);

-- 2. Create enrollment (result auto-created)
INSERT INTO enrollments (student_id, semester_id)
VALUES ('student-id', 'semester-id');

-- 3. Update result with marks (now that enrollment exists)
UPDATE results 
SET marks = 85, grade = 'A', percentile = '90'
WHERE student_id = 'student-id' AND semester_id = 'semester-id';
```

### Querying Related Data:

```sql
-- Get student with all related data
SELECT 
  s.*,
  c.name as course_name,
  json_agg(DISTINCT e.*) as enrollments,
  json_agg(DISTINCT r.*) as results
FROM students s
LEFT JOIN courses c ON s.course_id = c.id
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN results r ON s.id = r.student_id
WHERE s.user_id = 'user-123'
GROUP BY s.id, c.name;
```

---

## 📝 Notes for Developers

1. **Profiles are automatically managed** - don't manually insert/update unless needed
2. **Results are auto-created on enrollment** - just update marks/grades later
3. **Data changes cascade automatically** - update students table, related tables sync
4. **Unique enrollment constraint** prevents duplicate student-semester combinations

---

**Last Updated:** Migration Applied Successfully ✅
**Database Version:** QuickTech v1.0 - Full Relations Setup

