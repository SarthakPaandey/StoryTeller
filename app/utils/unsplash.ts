import { createApi } from 'unsplash-js';

/**
 * Extract keywords from a story for image search
 */
export function extractKeywords(storyText: string): string[] {
  // Remove common words and punctuation
  const cleanText = storyText.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
    
  // List of common words to exclude
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'this', 'that', 'these', 'those',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'in', 'of', 'from', 'with',
  ]);
  
  // Split by spaces and filter
  const words = cleanText.split(' ').filter(word => 
    word.length > 3 && !stopWords.has(word)
  );
  
  // Count word frequencies
  const wordFrequency: Record<string, number> = {};
  for (const word of words) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  }
  
  // Sort by frequency and get top words
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Return top 3 keywords or fewer if not enough
  return sortedWords.slice(0, 3);
}

/**
 * Get a relevant image URL from Unsplash based on keywords
 * Note: This is meant to be used server-side only
 */
export async function getImageForStory(storyText: string): Promise<string | null> {
  // Check if we have an Unsplash API key
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!unsplashAccessKey) {
    // No API key, use the fallback method
    return getMockImageForStory(storyText);
  }
  
  // Create Unsplash API client
  try {
    const unsplash = createApi({
      accessKey: unsplashAccessKey,
      fetch: fetch,
    });
    
    // Extract keywords from the story
    const keywords = extractKeywords(storyText);
    if (keywords.length === 0) {
      return getMockImageForStory(storyText);
    }
    
    // Join keywords for search query
    const searchQuery = keywords.join(' ');
    
    // Search Unsplash for an image
    const result = await unsplash.search.getPhotos({
      query: searchQuery,
      perPage: 1,
      orientation: 'landscape',
    });
    
    // Check if we got a valid result
    if (result.status !== 200 || !result.response?.results?.length) {
      return getMockImageForStory(storyText);
    }
    
    // Return the image URL
    return result.response.results[0].urls.regular;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return getMockImageForStory(storyText);
  }
}

/**
 * Fallback method to get images using source.unsplash.com
 */
export function getMockImageForStory(storyText: string): string {
  // Extract keywords
  const keywords = extractKeywords(storyText);
  let keywordString = keywords.join(',').toLowerCase();
  
  // Fallback if no keywords found
  if (!keywordString) {
    keywordString = 'fantasy,story,adventure'; 
  }
  
  // Use a random seed to prevent caching
  const randomSeed = Math.floor(Math.random() * 1000);
  
  // Use source.unsplash.com for immediate image access
  return `https://source.unsplash.com/1200x800/?${keywordString}&${randomSeed}`;
} 