'use server'

import { updateTag } from 'next/cache'
import { createClient } from './server'
import { unstable_cache } from 'next/cache'

const isDev = process.env.NODE_ENV !== 'production'

function logError(context: string, error: any) {
  if (isDev) {
    console.error(`[ServerAction:${context}]`, error?.message || error)
  }
}

/* =====================================================
   UPDATE STUDENT PROFILE
   ===================================================== */
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
  if (!userId) {
    return { success: false, message: 'Missing user ID' }
  }

  try {
    const supabase = await createClient()
    if (!supabase) throw new Error('Failed to create Supabase client')

    // Attempt to update
    const { data: updateResult, error: updateError } = await supabase
      .from('students')
      .update(profileData)
      .eq('user_id', userId)
      .select('id')

    if (updateError) {
      logError('updateStudentProfile:update', updateError)
    }

    // If no rows updated, insert
    if (updateError || !updateResult || updateResult.length === 0) {
      const insertData = { user_id: userId, ...profileData }
      const { error: insertError } = await supabase.from('students').insert(insertData)

      if (insertError) {
        logError('updateStudentProfile:insert', insertError)
        throw new Error(`Failed to create or update profile.`)
      }
    }

    // ✅ Invalidate caches
    updateTag(`student-${userId}`)
    updateTag('students')
    updateTag(`profile-${userId}`)

    return { success: true, message: 'Profile updated successfully' }
  } catch (error: any) {
    logError('updateStudentProfile:catch', error)
    return { success: false, message: error?.message || 'Unexpected error updating profile' }
  }
}

/* =====================================================
   CREATE ENROLLMENT
   ===================================================== */
export async function createEnrollment(studentId: string, semesterId: string) {
  if (!studentId || !semesterId) {
    return { success: false, message: 'Missing required fields' }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ student_id: studentId, semester_id: semesterId })
      .select()
      .single()

    if (error) throw error

    updateTag(`student-${studentId}`)
    updateTag(`enrollments-${studentId}`)
    updateTag(`semester-${semesterId}`)
    updateTag('enrollments')

    return { success: true, message: 'Enrollment created', data }
  } catch (error: any) {
    logError('createEnrollment', error)
    return { success: false, message: error?.message || 'Failed to create enrollment' }
  }
}

/* =====================================================
   UPDATE RESULT
   ===================================================== */
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
  if (!resultId) {
    return { success: false, message: 'Missing result ID' }
  }

  try {
    const supabase = await createClient()

    // Get current result to find related IDs
    const { data: currentResult, error: fetchError } = await supabase
      .from('results')
      .select('student_id, semester_id')
      .eq('id', resultId)
      .single()

    if (fetchError) throw fetchError

    const { error: updateError } = await supabase
      .from('results')
      .update(resultData)
      .eq('id', resultId)

    if (updateError) throw updateError

    // Refresh cache tags
    if (currentResult) {
      updateTag(`student-${currentResult.student_id}`)
      updateTag(`results-${currentResult.student_id}`)
      updateTag(`semester-${currentResult.semester_id}`)
    }
    updateTag(`result-${resultId}`)
    updateTag('results')

    return { success: true, message: 'Result updated successfully' }
  } catch (error: any) {
    logError('updateResult', error)
    return { success: false, message: error?.message || 'Failed to update result' }
  }
}

/* =====================================================
   CACHED QUERIES
   ===================================================== */
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
        .select('id, name, description, status, batch, city, mode, course_id, courses(name)')
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
    { tags: ['lectures'], revalidate: 1800 }
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
    { tags: ['results', 'all-results'], revalidate: 3600 }
  )()
}
