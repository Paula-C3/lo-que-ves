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
