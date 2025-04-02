import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate a story snippet based on a prompt using Gemini
 */
export async function generateStoryWithGemini(prompt: string, history?: Array<{ text: string; prompt: string }>) {
  // Get API key from environment
  const API_KEY = process.env.GEMINI_API_KEY || '';
  
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  
  // Initialize the Google Generative AI with the API key
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Get the model - use gemini-1.5-pro instead of gemini-pro
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // Build context from history if available
  let context = '';
  if (history && history.length > 0) {
    context = history.map(item => {
      return `Prompt: ${item.prompt}\nStory: ${item.text}`;
    }).join('\n\n');
  }
  
  // Create the full prompt
  const fullPrompt = `${context ? context + '\n\n' : ''}
  You are a creative storyteller crafting an engaging interactive story.
  
  Based on this prompt: "${prompt}", 
  
  Generate a vivid, descriptive story snippet (2-3 paragraphs) that ends at a point where the reader would need to make a choice.
  
  Make your story descriptive and engaging with sensory details and emotion.
  
  Also provide 3 distinct and interesting possible continuations for the story.
  
  Respond in JSON format with the following structure:
  {
    "story": "The story text here...",
    "choices": ["First choice", "Second choice", "Third choice"]
  }
  
  Make sure the choices are varied and lead to different potential outcomes.`;
  
  try {
    // Generate content with the Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Extract the JSON from the response
    try {
      // Look for JSON in the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON was found, try to parse the whole text
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      
      // Attempt to extract story and choices manually
      // Using multiline regex without 's' flag
      const storyMatch = text.match(/["']story["']\s*:\s*["']([\s\S]+?)["']/);
      const choicesMatch = text.match(/["']choices["']\s*:\s*\[([\s\S]*?)\]/);
      
      if (storyMatch && choicesMatch) {
        const story = storyMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
        const choicesText = choicesMatch[1];
        const choices = choicesText.split(',')
          .map(c => c.trim().replace(/^["']|["']$/g, ''))
          .filter(c => c.length > 0);
        
        if (choices.length > 0) {
          return { story, choices };
        }
      }
      
      // Final fallback
      return {
        story: "The AI couldn't generate a proper story. Let me create something for you...\n\nYou find yourself standing at a crossroads in a mysterious forest. The trees whisper secrets, and you sense that your choice of path will lead to very different adventures.",
        choices: [
          "Take the path glowing with blue light",
          "Follow the winding trail with red leaves",
          "Venture into the misty path straight ahead"
        ]
      };
    }
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
}