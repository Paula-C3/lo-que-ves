import { supabase } from './supabase'

export async function getPostsByLecture(lectureId) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('lecture_id', lectureId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getPostsByUser(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, lectures!inner(id, title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createPost(post) {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAllPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, lectures!inner(id, title)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function deletePost(id) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}
