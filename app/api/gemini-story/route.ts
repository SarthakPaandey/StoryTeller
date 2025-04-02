import { NextRequest, NextResponse } from 'next/server';
import { generateStoryWithGemini } from '../../utils/gemini';
import { getImageForStory, getMockImageForStory } from '../../utils/unsplash';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, history } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Check for API key in environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    // Use the mock generator if no Gemini API key is available
    if (!geminiApiKey) {
      return NextResponse.json(
        { 
          error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.',
          missingApiKey: true 
        },
        { status: 400 }
      );
    }
    
    // Generate story with Gemini
    let storyResult;
    try {
      storyResult = await generateStoryWithGemini(prompt, history);
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
      return NextResponse.json(
        { 
          error: 'Error with Gemini API: ' + (apiError as Error).message,
          apiError: true 
        },
        { status: 500 }
      );
    }
    
    // Generate an image for the story
    let storyImage;
    try {
      // Get an image URL for the story
      storyImage = await getImageForStory(storyResult.story);
    } catch (imageError) {
      console.error('Image generation error:', imageError);
      // If there's an error getting an image, continue without one
      storyImage = null;
    }
    
    // Return the result
    return NextResponse.json({
      ...storyResult,
      storyImage
    });
    
  } catch (error) {
    console.error('General error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 