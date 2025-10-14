import OpenAI from 'openai'
import { config } from './config'

export function getOpenAIClient(apiKey?: string) {
  return new OpenAI({
    apiKey: apiKey || config.openai.apiKey,
  })
}

export async function createEmbedding(text: string, apiKey?: string) {
  const client = getOpenAIClient(apiKey)
  
  const response = await client.embeddings.create({
    model: config.openai.embedModel,
    input: text,
  })
  
  return response.data[0].embedding
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const client = getOpenAIClient(apiKey)
    await client.models.retrieve('gpt-4o-mini')
    return true
  } catch (error) {
    return false
  }
}

export function chunkText(text: string, minSize = 300, maxSize = 500, overlap = 0.05): string[] {
  const chunks: string[] = []
  const words = text.split(/\s+/)
  
  let currentChunk: string[] = []
  let currentSize = 0
  
  for (const word of words) {
    currentChunk.push(word)
    currentSize += word.length + 1
    
    if (currentSize >= minSize) {
      const chunkText = currentChunk.join(' ')
      
      if (chunkText.length >= minSize && chunkText.length <= maxSize) {
        chunks.push(chunkText)
        
        // Calculate overlap
        const overlapWords = Math.floor(currentChunk.length * overlap)
        currentChunk = currentChunk.slice(-overlapWords)
        currentSize = currentChunk.reduce((sum, w) => sum + w.length + 1, 0)
      } else if (chunkText.length > maxSize) {
        // Split at maxSize
        const splitPoint = currentChunk.length - 1
        const beforeSplit = currentChunk.slice(0, splitPoint).join(' ')
        chunks.push(beforeSplit)
        
        currentChunk = currentChunk.slice(-1)
        currentSize = currentChunk[0].length
      }
    }
  }
  
  // Add remaining chunk
  if (currentChunk.length > 0) {
    const remaining = currentChunk.join(' ')
    if (remaining.length >= 50) {
      chunks.push(remaining)
    }
  }
  
  return chunks
}
