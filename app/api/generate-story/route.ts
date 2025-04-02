import { NextRequest, NextResponse } from 'next/server';
import { getMockImageForStory } from '../../utils/unsplash';

// This would normally connect to a real AI model API
const mockGenerateStory = async (prompt: string): Promise<{ story: string; choices: string[]; storyImage?: string }> => {
  // For demo purposes, we're using simple mock data
  // In a real app, this would call an AI service like Hugging Face or OpenAI
  
  // Add some randomness so stories aren't always the same
  const randomElement = Math.floor(Math.random() * 3);
  
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
  
  // Get the selected story
  const story = storyTemplates[randomElement];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate image based on story text
  const storyImage = getMockImageForStory(story);
  
  return {
    story: story,
    choices: choiceTemplates[randomElement],
    storyImage: storyImage
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
    
    const result = await mockGenerateStory(prompt);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}