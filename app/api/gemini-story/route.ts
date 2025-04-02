import { NextRequest, NextResponse } from 'next/server';
import { generateStoryWithGemini } from '../../utils/gemini';
import { getImageForStory, getMockImageForStory } from '../../utils/unsplash';

// Mock story generator for fallback
const generateMockStory = (prompt: string) => {
  const storyTemplates = [
    `As you ${prompt.toLowerCase()}, the world around you shifts and changes. The air feels different, charged with an energy you've never felt before. You find yourself standing at the edge of a great precipice, the winds howling around you carrying whispers of forgotten lands.

    In the distance, you can see a shimmering city of impossible architecture - towers that twist and curve defying gravity, bridges of light connecting floating islands. This must be what the legends spoke of.`,
    
    `The moment you ${prompt.toLowerCase()}, everything changes. A bright flash of light momentarily blinds you, and when your vision clears, you realize you're no longer where you were. The landscape stretches before you, a tapestry of colors you've never seen before, under a sky with three moons.

    A figure approaches from the distance, tall and elegant, with features that seem almost human but not quite. "We've been expecting you," they say with a voice that sounds like wind chimes.`,
    
    `Your decision to ${prompt.toLowerCase()} leads you down an unexpected path. As you proceed, the ordinary world fades away, replaced by something extraordinary. Ancient trees tower around you, their bark glowing with soft blue light, illuminating a path forward.

    Strange creatures watch from the shadows, their eyes reflecting the ethereal light. One steps forward - small, perhaps reaching your knee, with skin like polished stone. "Follow me," it says, "the Council awaits."`
  ];
  
  const choiceTemplates = [
    [
      "Approach the shimmering city cautiously",
      "Look for a way down the precipice",
      "Call out to see if anyone is nearby"
    ],
    [
      "Ask the figure who they are and where you are",
      "Look for a way to return home",
      "Express curiosity about this new world"
    ],
    [
      "Follow the small creature to the Council",
      "Ask what the Council wants with you",
      "Look for a different path through the glowing forest"
    ]
  ];
  
  // Choose a random template
  const randomIndex = Math.floor(Math.random() * storyTemplates.length);
  
  return {
    story: storyTemplates[randomIndex],
    choices: choiceTemplates[randomIndex]
  };
};

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
      
      // If Gemini API fails, use the mock generator as fallback
      console.log('Using mock story generator as fallback');
      storyResult = generateMockStory(prompt);
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