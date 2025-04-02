'use client';

import React, { useState } from 'react';
import StoryContainer from './components/StoryContainer';
import PromptForm from './components/PromptForm';

interface StorySegment {
  text: string;
  prompt: string;
  image?: string;
}

interface StoryState {
  currentStory: string;
  choices: string[];
  storyHistory: StorySegment[];
  isLoading: boolean;
  hasStarted: boolean;
  geminiError?: string;
  currentImage?: string;
  storyLength: 'short' | 'medium' | 'long';
  segmentsCount: number;
  isEnding: boolean;
}

export default function Home() {
  const [storyState, setStoryState] = useState<StoryState>({
    currentStory: '',
    choices: [],
    storyHistory: [],
    isLoading: false,
    hasStarted: false,
    storyLength: 'medium',
    segmentsCount: 0,
    isEnding: false,
  });

  const handleLengthChange = (length: 'short' | 'medium' | 'long') => {
    setStoryState(prev => ({ ...prev, storyLength: length }));
  };

  const getMaxSegments = () => {
    // Define maximum segments based on selected length
    switch (storyState.storyLength) {
      case 'short': return 3;
      case 'medium': return 7;
      case 'long': return 12;
      default: return 7;
    }
  };

  const handleStartStory = async (prompt: string) => {
    try {
      setStoryState(prev => ({ ...prev, isLoading: true, geminiError: undefined }));
      
      // Always use Gemini API for story generation
      const response = await fetch('/api/gemini-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, storyLength: storyState.storyLength }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle Gemini API key error specifically
        if (errorData.missingApiKey) {
          setStoryState(prev => ({ 
            ...prev, 
            isLoading: false,
            geminiError: errorData.error 
          }));
          return;
        }
        
        throw new Error('Failed to generate story');
      }
      
      const data = await response.json();
      
      setStoryState(prev => ({
        ...prev,
        currentStory: data.story,
        currentImage: data.storyImage || undefined,
        choices: data.choices,
        storyHistory: [{ text: data.story, prompt, image: data.storyImage }],
        isLoading: false,
        hasStarted: true,
        segmentsCount: 1,
      }));
    } catch (error) {
      console.error('Error generating story:', error);
      setStoryState(prev => ({ ...prev, isLoading: false }));
      alert('Failed to generate story. Please try again.');
    }
  };

  const handleChoiceSelection = async (choice: string) => {
    try {
      setStoryState(prev => ({ ...prev, isLoading: true }));
      
      // Check if user selected the "conclude story" option
      const isConcluding = choice.toLowerCase().includes('conclude') || 
                          choice.toLowerCase().includes('end the story');
      
      // Check if we're reaching the story length limit
      const maxSegments = getMaxSegments();
      const isApproachingEnd = storyState.segmentsCount >= maxSegments - 1;
      
      // Always use Gemini API for story generation
      const response = await fetch('/api/gemini-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: choice,
          history: storyState.storyHistory,
          concludeStory: isConcluding || isApproachingEnd,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to continue story');
      }
      
      const data = await response.json();
      
      setStoryState(prev => ({
        ...prev,
        currentStory: data.story,
        currentImage: data.storyImage || undefined,
        choices: isConcluding || isApproachingEnd || prev.segmentsCount >= maxSegments 
                ? [] 
                : data.choices.concat(["Conclude this story"]),
        storyHistory: [...prev.storyHistory, { text: data.story, prompt: choice, image: data.storyImage }],
        isLoading: false,
        segmentsCount: prev.segmentsCount + 1,
        isEnding: isConcluding || prev.segmentsCount >= maxSegments,
      }));
    } catch (error) {
      console.error('Error continuing story:', error);
      setStoryState(prev => ({ ...prev, isLoading: false }));
      alert('Failed to continue story. Please try again.');
    }
  };

  const handleRestartStory = () => {
    setStoryState({
      currentStory: '',
      choices: [],
      storyHistory: [],
      isLoading: false,
      hasStarted: false,
      storyLength: storyState.storyLength,
      segmentsCount: 0,
      isEnding: false,
    });
  };

  const handleSaveStory = () => {
    const storyText = storyState.storyHistory.map(segment => {
      const imageText = segment.image ? `[Image: ${segment.image}]\n\n` : '';
      return `Prompt: ${segment.prompt}\n\n${imageText}${segment.text}\n\n---\n\n`;
    }).join('');
    
    const blob = new Blob([storyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-ai-story.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <h1>AI Storytelling Adventure</h1>
        <p>Create interactive stories powered by AI and your imagination</p>
      </header>

      <div className="flex-grow">
        {!storyState.hasStarted ? (
          <div className="start-container">
            <h2 className="start-title">Begin Your Adventure</h2>
            
            {storyState.geminiError && (
              <div className="error-message">
                <p className="error-title">Error: {storyState.geminiError}</p>
                <p>Please check your Gemini API key in the environment variables.</p>
              </div>
            )}
            
            <div className="story-length-selector mb-6">
              <p className="mb-2 font-medium">Choose your story length:</p>
              <div className="flex gap-3">
                <button 
                  className={`px-4 py-2 rounded-md transition-colors ${storyState.storyLength === 'short' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleLengthChange('short')}
                >
                  Short (3 scenes)
                </button>
                <button 
                  className={`px-4 py-2 rounded-md transition-colors ${storyState.storyLength === 'medium' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleLengthChange('medium')}
                >
                  Medium (7 scenes)
                </button>
                <button 
                  className={`px-4 py-2 rounded-md transition-colors ${storyState.storyLength === 'long' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleLengthChange('long')}
                >
                  Long (12 scenes)
                </button>
              </div>
            </div>
            
            <p className="start-description">
              Enter a prompt to begin your story. Be creative! Some examples:
              <span className="example-prompt">- "A dragon in a futuristic city"</span>
              <span className="example-prompt">- "A detective solving a mysterious case"</span>
              <span className="example-prompt">- "An explorer discovering an ancient temple"</span>
            </p>
            <PromptForm 
              onSubmit={handleStartStory} 
              isLoading={storyState.isLoading}
              buttonText="Create My Adventure"
            />
          </div>
        ) : (
          <StoryContainer
            story={storyState.currentStory}
            choices={storyState.choices}
            onChoiceSelect={handleChoiceSelection}
            onSaveStory={handleSaveStory}
            onRestartStory={handleRestartStory}
            isLoading={storyState.isLoading}
            storyImage={storyState.currentImage}
            storyProgress={{
              current: storyState.segmentsCount,
              max: getMaxSegments(),
              isEnding: storyState.isEnding
            }}
          />
        )}
      </div>

      <footer>
        <p>&copy; {new Date().getFullYear()} AI Storytelling Adventure</p>
      </footer>
    </div>
  );
} 