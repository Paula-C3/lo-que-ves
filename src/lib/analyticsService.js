import { supabase } from './supabase'

export async function getTotalUsers() {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count
}

export async function getPostsPerLecture() {
  const { data, error } = await supabase
    .from('posts')
    .select('lecture_id')

  if (error) throw error

  const counts = {}
  data.forEach(p => {
    counts[p.lecture_id] = (counts[p.lecture_id] || 0) + 1
  })
  return counts
}

export async function getLectureTitles() {
  const { data, error } = await supabase
    .from('lectures')
    .select('id, title')

  if (error) throw error
  return data
}

export async function getAnswersAnalytics() {
  const { data, error } = await supabase
    .from('posts')
    .select('answers, lecture_id')

  if (error) throw error

  // aggregate q2 (select) counts
  const q2Counts = {
    muy_relevante: 0,
    relevante: 0,
    algo_relevante: 0,
    poco_relevante: 0
  }

  // aggregate q3 (scale) counts
  const q3Counts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }

  // collect all q1 (text) answers
  const q1Answers = []

  data.forEach(post => {
    if (!post.answers) return
    if (post.answers.q1) q1Answers.push(post.answers.q1)
    if (post.answers.q2 && q2Counts[post.answers.q2] !== undefined) {
      q2Counts[post.answers.q2]++
    }
    if (post.answers.q3 && q3Counts[post.answers.q3] !== undefined) {
      q3Counts[post.answers.q3]++
    }
  })

  return { q1Answers, q2Counts, q3Counts, total: data.length }
}
