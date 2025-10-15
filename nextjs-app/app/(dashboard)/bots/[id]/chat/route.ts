import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get bot configuration
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', params.id)
      .single()

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    // Generate embedding for the user's message
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: message,
    })

    const embedding = embeddingResponse.data[0].embedding

    // Search for relevant chunks using vector similarity
    const { data: chunks, error: searchError } = await supabase.rpc(
      'match_chunks',
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5,
        bot_id_param: params.id,
      }
    )

    // Build context from relevant chunks
    let context = ''
    if (chunks && chunks.length > 0) {
      context = chunks.map((chunk: any) => chunk.content).join('\n\n')
    }

    // Build the system prompt
    const systemPrompt = bot.system_prompt || 'You are a helpful assistant.'
    const fullSystemPrompt = context
      ? `${systemPrompt}\n\nUse the following information to answer the user's question:\n\n${context}`
      : systemPrompt

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: message },
      ],
      temperature: bot.temperature || 0.7,
      max_tokens: bot.max_tokens || 500,
    })

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

    return NextResponse.json({ 
      response,
      sources_used: chunks?.length || 0 
    })

  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

Your folder structure should now be:
```
nextjs-app/app/api/bots/[id]/
  chat/              ← NEW FOLDER
    route.ts         ← NEW FILE (create this)
  route.ts           ← Already exists
