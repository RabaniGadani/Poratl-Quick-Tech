'use server'

import { updateTag } from 'next/cache'
import { createClient } from './server'
import { unstable_cache } from 'next/cache'

// =====================================================
// STUDENT PROFILE — Update / Create with Avatar Handling
// =====================================================

export async function updateStudentProfile(
  userId: string,
  profileData: {
    full_name?: string
    father_name?: string
    student_id?: string
    rollNo?: string
    city?: string
    gender?: string
    email?: string
    currently?: string
    course?: string
    batch?: string
    avatar?: string
  }
) {
  if (!userId) throw new Error('User ID is required')

  const supabase = await createClient()

  console.log('🟢 [updateStudentProfile] Start')
  console.log('userId:', userId)
  console.log('profileData:', profileData)

  // Validate avatar (prevent saving invalid paths)
  if (profileData.avatar && !profileData.avatar.startsWith('http')) {
    console.warn('⚠️ Skipping invalid avatar URL:', profileData.avatar)
    delete profileData.avatar
  }

  // Check if the student already exists
  const { data: existing, error: fetchError } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('❌ Failed to fetch existing student:', fetchError.message)
    throw new Error(fetchError.message)
  }

  let dbError = null

  if (existing) {
    console.log('🟡 Student exists — updating record...')
    const { error } = await supabase
      .from('students')
      .update(profileData)
      .eq('user_id', userId)
    dbError = error
  } else {
    console.log('🟢 Student not found — creating new record...')
    const { error } = await supabase
      .from('students')
      .insert({ user_id: userId, ...profileData })
    dbError = error
  }

  if (dbError) {
    console.error('❌ Database error:', dbError.message)
    throw new Error(`Failed to save student profile: ${dbError.message}`)
  }

  // Refresh caches immediately
  updateTag(`student-${userId}`)
  updateTag(`profile-${userId}`)
  updateTag('students')

  console.log('✅ [updateStudentProfile] Success for user:', userId)
  return { success: true }
}

// =====================================================
// ENROLLMENT — Create with cache invalidation
// =====================================================

export async function createEnrollment(studentId: string, semesterId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      student_id: studentId,
      semester_id: semesterId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create enrollment: ${error.message}`)
  }

  updateTag(`student-${studentId}`)
  updateTag(`enrollments-${studentId}`)
  updateTag(`semester-${semesterId}`)
  updateTag('enrollments')

  return { success: true, enrollment: data }
}

// =====================================================
// RESULT — Update with cache invalidation
// =====================================================

export async function updateResult(
  resultId: string,
  resultData: {
    marks?: number
    grade?: string
    percentile?: string
    status?: string
    subjects?: string
  }
) {
  const supabase = await createClient()

  const { data: currentResult } = await supabase
    .from('results')
    .select('student_id, semester_id')
    .eq('id', resultId)
    .single()

  const { error } = await supabase
    .from('results')
    .update(resultData)
    .eq('id', resultId)

  if (error) {
    throw new Error(`Failed to update result: ${error.message}`)
  }

  if (currentResult) {
    updateTag(`student-${currentResult.student_id}`)
    updateTag(`results-${currentResult.student_id}`)
    updateTag(`semester-${currentResult.semester_id}`)
  }
  updateTag(`result-${resultId}`)
  updateTag('results')

  return { success: true }
}

// =====================================================
// CACHED DATA FETCHING FUNCTIONS
// =====================================================

export async function getCachedStudent(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    },
    [`student-${userId}`],
    {
      tags: [`student-${userId}`, `profile-${userId}`],
      revalidate: 3600,
    }
  )()
}

export async function getCachedStudentResults(userId: string) {
  const student = await getCachedStudent(userId)
  if (!student?.id) return []

  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('student_id', student.id)
        .order('semester', { ascending: true })

      if (error) throw error
      return data || []
    },
    [`results-${student.id}`, `student-${userId}`],
    {
      tags: [`results-${student.id}`, `results-${userId}`, 'results'],
      revalidate: 3600,
    }
  )()
}

export async function getCachedSemesters() {
  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('semesters')
        .select(
          'id, name, description, status, batch, city, mode, course_id, courses(name)'
        )
        .order('created_at', { ascending: true })

      if (error) throw error

      return (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        status: s.status,
        batch: s.batch,
        course_id: s.course_id,
        course_name: s.courses?.name || '',
        city: s.city,
        mode: s.mode,
      }))
    },
    ['semesters'],
    {
      tags: ['semesters', 'courses'],
      revalidate: 3600,
    }
  )()
}

export async function getCachedLectures() {
  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('lectures')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    ['lectures'],
    {
      tags: ['lectures'],
      revalidate: 1800,
    }
  )()
}

export async function getCachedAllResults() {
  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    ['all-results'],
    {
      tags: ['results', 'all-results'],
      revalidate: 3600,
    }
  )()
}
