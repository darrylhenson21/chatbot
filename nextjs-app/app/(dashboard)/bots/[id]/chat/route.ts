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

    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', params.id)
      .single()

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: message,
    })

    const embedding = embeddingResponse.data[0].embedding

    const { data: chunks, error: searchError } = await supabase.rpc(
      'match_chunks',
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5,
        bot_id_param: params.id,
      }
    )

    let context = ''
    if (chunks && chunks.length > 0) {
      context = chunks.map((chunk: any) => chunk.content).join('\n\n')
    }

    const systemPrompt = bot.system_prompt || 'You are a helpful assistant.'
    const fullSystemPrompt = context
      ? `${systemPrompt}\n\nUse the following information to answer the user's question:\n\n${context}`
      : systemPrompt

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
