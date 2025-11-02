'use server'

import { updateTag } from 'next/cache'
import { createClient } from './server'
import { unstable_cache } from 'next/cache'

// =====================================================
// CACHED DATA FETCHING FUNCTIONS (with cache tags)
// =====================================================

/**
 * Server Action to update student profile with cache invalidation
 * Uses updateTag to immediately refresh the cache
 */
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
  const supabase = await createClient()

  // Try to update first
  const { data: updateDataResult, error: updateError } = await supabase
    .from('students')
    .update(profileData)
    .eq('user_id', userId)
    .select('id')

  // If no row was updated, insert new
  if (updateError) {
    // If update failed, try to insert
    const insertData = {
      user_id: userId,
      ...profileData,
    }
    const { error: insertError } = await supabase
      .from('students')
      .insert(insertData)

    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`)
    }
  } else if (!updateDataResult || updateDataResult.length === 0) {
    // No error but no rows updated, try insert
    const insertData = {
      user_id: userId,
      ...profileData,
    }
    const { error: insertError } = await supabase
      .from('students')
      .insert(insertData)

    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`)
    }
  }

  // Immediately update the cache tag for this student
  // This ensures the user sees their changes right away
  updateTag(`student-${userId}`)
  
  // Also update general cache tags if needed
  updateTag('students')
  updateTag(`profile-${userId}`)

  return { success: true }
}

/**
 * Server Action to create/update enrollment with cache invalidation
 */
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

  // Update cache tags for immediate refresh
  updateTag(`student-${studentId}`)
  updateTag(`enrollments-${studentId}`)
  updateTag(`semester-${semesterId}`)
  updateTag('enrollments')

  return { success: true, enrollment: data }
}

/**
 * Server Action to update result with cache invalidation
 */
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

  // Get current result to find student_id
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

  // Update cache tags
  if (currentResult) {
    updateTag(`student-${currentResult.student_id}`)
    updateTag(`results-${currentResult.student_id}`)
    updateTag(`semester-${currentResult.semester_id}`)
  }
  updateTag(`result-${resultId}`)
  updateTag('results')

  return { success: true }
}

/**
 * Get cached student data with cache tags
 */
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
    [`student-${userId}`], // Cache key
    {
      tags: [`student-${userId}`, `profile-${userId}`], // Cache tags
      revalidate: 3600, // Revalidate after 1 hour (fallback)
    }
  )()
}

/**
 * Get cached student results with cache tags
 */
export async function getCachedStudentResults(userId: string) {
  // First get student_id from user_id
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

/**
 * Get cached semesters with cache tags
 */
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

/**
 * Get cached lectures with cache tags
 */
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
      revalidate: 1800, // 30 minutes
    }
  )()
}

/**
 * Get all cached results with cache tags
 */
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

/**
 * Note: For background revalidation (next request), you can use revalidateTag from 'next/cache'
 * For immediate refresh, use updateTag (which is what we're using above)
 */

