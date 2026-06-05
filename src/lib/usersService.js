import { supabase } from './supabase'

export async function loginUser(code, career) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !data) return { status: 'not_found' }
  if (data.career !== career) return { status: 'mismatch' }
  return { status: 'ok', user: data }
}

export async function registerUser(code, career) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('code', code)
    .single()

  if (existing) return { status: 'already_exists' }

  const { data, error } = await supabase
    .from('users')
    .insert([{
      code,
      career,
      name: `Estudiante ${code.slice(-4)}`,
      avatar: '#FFD400'
    }])
    .select()
    .single()

  if (error) throw error
  return { status: 'ok', user: data }
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
