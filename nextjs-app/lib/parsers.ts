import * as cheerio from 'cheerio'
import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'

export async function parseHTML(html: string): Promise<string> {
  const $ = cheerio.load(html)
  
  // Remove script and style elements
  $('script, style, nav, footer, header').remove()
  
  // Extract text from main content areas
  const text = $('body').text()
  
  // Clean up whitespace
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
}

export async function parsePDF(buffer: Buffer): Promise<{ text: string; pages: number }> {
  const data = await pdfParse(buffer)
  
  return {
    text: data.text.replace(/\s+/g, ' ').trim(),
    pages: data.numpages,
  }
}

export async function parseDOCX(buffer: Buffer): Promise<{ text: string }> {
  const result = await mammoth.extractRawText({ buffer })
  
  return {
    text: result.value.replace(/\s+/g, ' ').trim(),
  }
}

export function estimatePages(text: string): number {
  // Rough estimate: ~300 words per page
  const words = text.split(/\s+/).length
  return Math.ceil(words / 300)
}

export async function crawlURL(url: string, maxPages: number = 10): Promise<{
  pages: Array<{ url: string; title: string; content: string }>;
  error?: string;
}> {
  try {
    const baseUrl = new URL(url)
    const visited = new Set<string>()
    const pages: Array<{ url: string; title: string; content: string }> = []
    
    const crawlPage = async (pageUrl: string) => {
      if (visited.size >= maxPages) return
      if (visited.has(pageUrl)) return
      
      const currentUrl = new URL(pageUrl)
      if (currentUrl.hostname !== baseUrl.hostname) return
      
      visited.add(pageUrl)
      
      try {
        const response = await fetch(pageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ChatbotBuilder/1.0)',
          },
        })
        
        if (!response.ok) return
        
        const html = await response.text()
        const $ = cheerio.load(html)
        
        const title = $('title').text() || pageUrl
        const content = await parseHTML(html)
        
        if (content.length > 100) {
          pages.push({ url: pageUrl, title, content })
        }
        
        // Only crawl depth 1 from same host
        if (pageUrl === url) {
          const links = $('a[href]')
            .map((_, el) => $(el).attr('href'))
            .get()
            .filter(Boolean)
            .map(href => {
              try {
                return new URL(href!, baseUrl).href
              } catch {
                return null
              }
            })
            .filter(Boolean) as string[]
          
          const uniqueLinks = [...new Set(links)]
          
          for (const link of uniqueLinks.slice(0, maxPages - 1)) {
            await crawlPage(link)
            if (visited.size >= maxPages) break
          }
        }
      } catch (err) {
        console.error(`Failed to crawl ${pageUrl}:`, err)
      }
    }
    
    await crawlPage(url)
    
    return { pages }
  } catch (error: any) {
    return {
      pages: [],
      error: error.message || 'Failed to crawl URL',
    }
  }
}
