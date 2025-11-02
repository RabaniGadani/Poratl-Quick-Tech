# Using `updateTag` in Next.js 16

## ✅ Yes, `updateTag` is available in Next.js 16!

The `updateTag` function allows you to **immediately** refresh cached data associated with a specific cache tag. This is perfect for scenarios where users need to see their changes reflected instantly.

---

## 📋 Key Points

### **Availability**
- ✅ Available in **Next.js 16+**
- ✅ Works with **React 19**
- ✅ Your project uses Next.js 16.0.1 ✅

### **Usage Restrictions**
- ⚠️ **Can ONLY be called from Server Actions** (files with `'use server'`)
- ❌ Cannot be used in Route Handlers
- ❌ Cannot be used in Client Components
- ❌ Cannot be used in regular server functions

### **When to Use**
- ✅ **After form submissions** - User updates profile → see changes immediately
- ✅ **After data mutations** - Create/update records → instant refresh
- ✅ **User-specific updates** - When users modify their own data

### **Alternative: `revalidateTag`**
- Use `revalidateTag` for background revalidation (next request)
- Use `updateTag` for immediate refresh (current request)

---

## 🚀 Examples

### **Example 1: Update Student Profile**

```typescript
'use server'

import { updateTag } from 'next/cache'
import { createClient } from './server'

export async function updateStudentProfile(userId: string, data: any) {
  const supabase = await createClient()
  
  // Update database
  await supabase
    .from('students')
    .update(data)
    .eq('user_id', userId)

  // Immediately refresh cache - user sees changes right away!
  updateTag(`student-${userId}`)
  updateTag(`profile-${userId}`)
}
```

### **Example 2: Create Enrollment**

```typescript
'use server'

import { updateTag } from 'next/cache'

export async function createEnrollment(studentId: string, semesterId: string) {
  const supabase = await createClient()
  
  // Create enrollment
  await supabase.from('enrollments').insert({
    student_id: studentId,
    semester_id: semesterId,
  })

  // Refresh related caches immediately
  updateTag(`student-${studentId}`)
  updateTag(`enrollments-${studentId}`)
  updateTag(`semester-${semesterId}`)
}
```

### **Example 3: Using with `unstable_cache`**

```typescript
import { unstable_cache } from 'next/cache'
import { updateTag } from 'next/cache'

// Cache function with tags
async function getCachedStudent(userId: string) {
  return unstable_cache(
    async () => {
      // Fetch student data
      const supabase = await createClient()
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single()
      return data
    },
    [`student-${userId}`],
    {
      tags: [`student-${userId}`], // Tag the cache
      revalidate: 3600,
    }
  )()
}

// Update and invalidate
export async function updateProfile(userId: string, data: any) {
  await updateDatabase(userId, data)
  updateTag(`student-${userId}`) // Cache refreshed immediately!
}
```

---

## 🔄 Comparison: `updateTag` vs `revalidateTag`

| Feature | `updateTag` | `revalidateTag` |
|---------|-------------|-----------------|
| **Timing** | Immediate (current request) | Background (next request) |
| **Use Case** | User actions, form submissions | Scheduled updates, bulk operations |
| **Performance** | Slightly slower (blocks) | Faster (non-blocking) |
| **User Experience** | See changes instantly | Changes visible on next visit |

---

## 💡 Best Practices

### **1. Use Specific Tags**
```typescript
// ✅ Good - specific
updateTag(`student-${userId}`)

// ❌ Avoid - too broad (may affect other users)
updateTag('students')
```

### **2. Tag Related Data**
```typescript
// Update multiple related tags
updateTag(`student-${userId}`)
updateTag(`profile-${userId}`)
updateTag(`enrollments-${userId}`)
```

### **3. Combine with Database Updates**
```typescript
export async function updateStudent(userId: string, data: any) {
  // 1. Update database
  await supabase.from('students').update(data).eq('user_id', userId)
  
  // 2. Immediately refresh cache
  updateTag(`student-${userId}`)
  
  // 3. Return success
  return { success: true }
}
```

---

## 🎯 Use Cases in Your Student Portal

### **Perfect For:**
1. **Profile Updates** - Student updates their profile → instant refresh
2. **Enrollment Creation** - New enrollment → cache updated immediately
3. **Result Updates** - Grades updated → students see changes right away
4. **Avatar Changes** - Profile picture updated → immediate display

### **Example: Profile Page Update**
```typescript
// In your profile update form
'use client'

import { updateStudentProfile } from '@/lib/actions'

export function ProfileForm() {
  const handleSubmit = async (data: FormData) => {
    await updateStudentProfile(userId, {
      full_name: data.get('name'),
      // ... other fields
    })
    // Cache is already updated! User sees changes immediately
    router.refresh() // Optional: refresh the page
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 📚 Documentation

- **Next.js Docs:** https://nextjs.org/docs/app/api-reference/functions/updateTag
- **Cache Tags:** https://nextjs.org/docs/app/api-reference/functions/revalidateTag

---

## ✅ Summary

- **Available:** Yes, in Next.js 16 ✅
- **Location:** Only in Server Actions (`'use server'`)
- **Purpose:** Immediate cache refresh for user-facing updates
- **Your Setup:** Next.js 16.0.1 - Ready to use! 🚀

---

**Created:** Example server actions file created in `lib/actions.ts`

