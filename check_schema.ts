import { createClient } from './src/lib/supabase/server'

async function checkSchema() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching users:', error)
  } else {
    console.log('User columns:', Object.keys(data[0] || {}))
  }
}

checkSchema()
