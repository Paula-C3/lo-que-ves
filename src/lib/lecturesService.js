import { supabase } from './supabase'

export async function getLectures() {
  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .lte('visible_from', new Date().toISOString())
    .order('datetime', { ascending: false })

  if (error) throw error
  return data
}

export async function getLectureById(id) {
  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('id', id)
    .lte('visible_from', new Date().toISOString())
    .single()

  if (error) throw error
  return data
}

export async function getAllLectures() {
  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .order('datetime', { ascending: false })

  if (error) throw error
  return data
}

export async function createLecture(lecture) {
  const { data, error } = await supabase
    .from('lectures')
    .insert([{ ...lecture, id: crypto.randomUUID() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLecture(id, fields) {
  const { data, error } = await supabase
    .from('lectures')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLecture(id) {
  const { error } = await supabase
    .from('lectures')
    .delete()
    .eq('id', id)

  if (error) throw error
}
