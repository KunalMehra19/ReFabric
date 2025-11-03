// Temporary test utility to check Supabase connection
// Remove this file after debugging

import { supabase } from '../lib/supabase'

export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    // Test 1: Check if Supabase client is initialized
    console.log('Test 1: Supabase client initialized:', !!supabase)
    
    // Test 2: Try a simple query
    console.log('Test 2: Testing simple query...')
    const { data, error, status } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    console.log('Query result:', { data, error, status })
    
    // Test 3: Check auth session
    console.log('Test 3: Checking auth session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session:', { hasSession: !!session, userId: session?.user?.id, error: sessionError })
    
    return { success: !error, data, error }
  } catch (err) {
    console.error('Test failed:', err)
    return { success: false, error: err }
  }
}

// Call this from browser console: testSupabaseConnection()

