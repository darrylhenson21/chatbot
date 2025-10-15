import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: sources, error } = await supabase
      .from('sources')
      .select(`
        id,
        name,
        type,
        status,
        created_at,
        chunks:chunks(count)
      `)
      .eq('bot_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formattedSources = sources.map(source => ({
      ...source,
      chunk_count: source.chunks[0]?.count || 0,
    }))

    return NextResponse.json(formattedSources)
  } catch (error: any) {
    console.error('Get sources error:', error)
    return NextResponse.json({ error: 'Failed to load sources' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''
    let fileType = ''

    if (file.name.endsWith('.pdf')) {
      // Dynamic import to avoid build-time issues
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
      fileType = 'pdf'
    } else if (file.name.endsWith('.txt')) {
      text = buffer.toString('utf-8')
      fileType = 'txt'
    } else if (file.name.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
      fileType = 'docx'
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text content found' }, { status: 400 })
    }

    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .insert({
        bot_id: params.id,
        name: file.name,
        type: fileType,
        status: 'processing',
      })
      .select()
      .single()

    if (sourceError) throw sourceError

    const chunks = splitIntoChunks(text, 500)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk,
      })

      const embedding = embeddingResponse.data[0].embedding

      await supabase.from('chunks').insert({
        source_id: source.id,
        bot_id: params.id,
        content: chunk,
        embedding: embedding,
        chunk_index: i,
      })
    }

    await supabase
      .from('sources')
      .update({ status: 'completed' })
      .eq('id', source.id)

    return NextResponse.json({ 
      success: true,
      source_id: source.id,
      chunks_created: chunks.length 
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

function splitIntoChunks(text: string, maxTokens: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    const estimatedTokens = (currentChunk + sentence).length / 4

    if (estimatedTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter(chunk => chunk.length > 0)
}
