import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate a story snippet based on a prompt using Gemini
 */
export async function generateStoryWithGemini(
  prompt: string, 
  history?: Array<{ text: string; prompt: string }>,
  concludeStory: boolean = false
) {
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
  let fullPrompt;
  
  if (concludeStory) {
    // Prompt for concluding the story
    fullPrompt = `${context ? context + '\n\n' : ''}
    You are a creative storyteller crafting the conclusion to an engaging interactive story.
    
    Based on this prompt: "${prompt}" and the story history above, 
    
    Generate a satisfying, meaningful conclusion to the story (2-3 paragraphs). 
    Wrap up the main themes, resolve conflicts, and provide a sense of closure.
    
    Make the ending emotionally resonant and memorable.
    
    Respond in JSON format with the following structure:
    {
      "story": "The conclusion text here..."
    }
    
    Do not include any choices as this is the end of the story.`;
  } else {
    // Regular story continuation prompt
    fullPrompt = `${context ? context + '\n\n' : ''}
    You are a creative storyteller crafting an engaging interactive story.
    
    Based on this prompt: "${prompt}", 
    
    Generate a vivid, descriptive story snippet (2-3 paragraphs) that ends at a point where the reader would need to make a choice.
    
    The story should be simple to read and understand, and should be suitable for 16+ year children.
    
    Also, provide 3 distinct and interesting possible continuations for the story.
    
    Respond in JSON format with the following structure:
    {
      "story": "The story text here...",
      "choices": ["First choice", "Second choice", "Third choice"]
    }
    
    Make sure the choices are varied and lead to different potential outcomes.`;
  }
  
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
        const parsedJson = JSON.parse(jsonMatch[0]);
        
        // Handle conclusion case (no choices needed)
        if (concludeStory && !parsedJson.choices) {
          return {
            story: parsedJson.story,
            choices: []
          };
        }
        
        return parsedJson;
      }
      
      // If no JSON was found, try to parse the whole text
      const parsedJson = JSON.parse(text);
      
      // Handle conclusion case (no choices needed)
      if (concludeStory && !parsedJson.choices) {
        return {
          story: parsedJson.story,
          choices: []
        };
      }
      
      return parsedJson;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      
      // Conclusion fallback
      if (concludeStory) {
        return {
          story: "As your journey comes to an end, you reflect on all that has transpired. The challenges faced, the choices made, and the growth experienced along the way have all shaped this unique adventure.\n\nThough this story concludes here, the memories and impact remain. Every ending is but a prelude to new beginnings, new adventures waiting to unfold.",
          choices: []
        };
      }
      
      // Attempt to extract story and choices manually for non-conclusion
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
        choices: concludeStory ? [] : [
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
