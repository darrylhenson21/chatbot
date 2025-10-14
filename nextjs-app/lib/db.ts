import { createClient } from '@supabase/supabase-js'

// Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Simple query wrapper using Supabase methods
export const query = async (text: string, params?: any[]) => {
  console.log('Query:', text.substring(0, 100), 'Params:', params)
  
  // For now, use Supabase REST API methods directly
  // This is a simplified version - we'll update individual routes to use Supabase client
  
  try {
    // Check accounts table
    if (text.includes('FROM accounts')) {
      const { data, error } = await supabase.from('accounts').select('*').limit(1)
      if (error) throw error
      return { rows: data || [], rowCount: data?.length || 0 }
    }
    
    // Check sessions
    if (text.includes('FROM sessions')) {
      const { data, error } = await supabase.from('sessions').select('*')
      if (error) throw error
      return { rows: data || [], rowCount: data?.length || 0 }
    }
    
    // Check auth_attempts
    if (text.includes('FROM auth_attempts')) {
      return { rows: [], rowCount: 0 } // Return empty for now
    }
    
    // Check bots
    if (text.includes('FROM bots')) {
      const { data, error } = await supabase.from('bots').select('*')
      if (error) throw error
      return { rows: data || [], rowCount: data?.length || 0 }
    }
    
    // INSERT queries - extract table and values
    if (text.toUpperCase().includes('INSERT INTO')) {
      // Will handle in specific routes
      return { rows: [], rowCount: 1 }
    }
    
    // Default return
    return { rows: [], rowCount: 0 }
    
  } catch (error: any) {
    console.error('Query error:', error)
    return { rows: [], rowCount: 0 }
  }
}

export const getClient = async () => {
  return {
    query,
    release: () => {},
  }
}

export default { query, supabase }
