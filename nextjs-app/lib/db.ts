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

// Enhanced query wrapper using Supabase methods
export const query = async (text: string, params?: any[]) => {
  console.log('Query:', text.substring(0, 100), 'Params:', params)
  
  try {
    // Handle COUNT queries for bots
    if (text.includes('COUNT(*) as count FROM bots WHERE account_id')) {
      const accountId = params?.[0]
      const { data, error } = await supabase
        .from('bots')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
      
      if (error) throw error
      return { rows: [{ count: data || 0 }], rowCount: 1 }
    }
    
    // Handle INSERT INTO bots
    if (text.includes('INSERT INTO bots') && text.includes('RETURNING')) {
      const accountId = params?.[0]
      const name = params?.[1]
      
      const { data, error } = await supabase
        .from('bots')
        .insert({ account_id: accountId, name: name })
        .select()
        .single()
      
      if (error) throw error
      return { rows: [data], rowCount: 1 }
    }
    
    // Handle INSERT INTO bot_limits
    if (text.includes('INSERT INTO bot_limits')) {
      const botId = params?.[0]
      
      const { data, error } = await supabase
        .from('bot_limits')
        .insert({ bot_id: botId })
        .select()
        .single()
      
      if (error) throw error
      return { rows: [data], rowCount: 1 }
    }
    
    // Handle SELECT bots with joins (for GET request)
    if (text.includes('FROM bots b') && text.includes('account_id')) {
      const accountId = params?.[0]
      
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          domains:domains(count),
          sources:sources(count)
        `)
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Format the response to match expected structure
      const formattedData = (data || []).map(bot => ({
        ...bot,
        domain_count: bot.domains?.length || 0,
        source_count: bot.sources?.filter((s: any) => s.status === 'completed').length || 0
      }))
      
      return { rows: formattedData, rowCount: formattedData.length }
    }
    
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
    
    // Check bots (simple)
    if (text.includes('FROM bots')) {
      const { data, error } = await supabase.from('bots').select('*')
      if (error) throw error
      return { rows: data || [], rowCount: data?.length || 0 }
    }
    
    // Default return
    console.warn('Unhandled query pattern:', text.substring(0, 50))
    return { rows: [], rowCount: 0 }
    
  } catch (error: any) {
    console.error('Query error:', error)
    throw error // Re-throw so the route handler can catch it
  }
}

export const getClient = async () => {
  return {
    query,
    release: () => {},
  }
}

export default { query, supabase }
