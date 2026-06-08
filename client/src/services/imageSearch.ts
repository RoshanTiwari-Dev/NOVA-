/**
 * Image Search Service
 * Fetches relevant images for chat topics using DuckDuckGo API
 */

export interface ImageResult {
  url: string;
  title: string;
  source: string;
}

export async function searchImages(query: string, limit: number = 3): Promise<ImageResult[]> {
  try {
    // Using DuckDuckGo's image search API (no key required)
    const response = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&ia=images&iax=images`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      console.error('Image search failed:', response.statusText);
      return [];
    }

    // Parse HTML and extract image URLs
    const html = await response.text();
    const imageUrls: ImageResult[] = [];

    // Extract image URLs from the HTML
    const imgRegex = /src="(https:\/\/[^"]+\.(?:jpg|jpeg|png|gif|webp))"/gi;
    let match;

    while ((match = imgRegex.exec(html)) && imageUrls.length < limit) {
      const url = match[1];
      if (url && !url.includes('logo') && !url.includes('icon')) {
        imageUrls.push({
          url,
          title: query,
          source: 'DuckDuckGo',
        });
      }
    }

    return imageUrls;
  } catch (error) {
    console.error('Error searching images:', error);
    return [];
  }
}

/**
 * Extract keywords from chat message for image search
 */
export function extractKeywords(message: string): string {
  // Remove common words and clean the message
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
  ];

  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  // Return top keywords
  return words.slice(0, 3).join(' ');
}

/**
 * Fetch images for a chat message
 */
export async function getImagesForMessage(message: string): Promise<ImageResult[]> {
  const keywords = extractKeywords(message);
  
  if (!keywords) {
    return [];
  }

  return searchImages(keywords, 3);
}
