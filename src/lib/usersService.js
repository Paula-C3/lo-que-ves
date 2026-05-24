import { supabase } from './supabase'

export async function getUserByCode(code) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('code', code)
    .single()

  if (error) return null
  return data
}

export async function createUser(code, career) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      code,
      career,
      name: `Estudiante ${code.slice(-4)}`,
      avatar: 'https://i.pravatar.cc/150?img=1'
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUser(id, name, avatar) {
  const { data, error } = await supabase
    .from('users')
    .update({ name, avatar })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
