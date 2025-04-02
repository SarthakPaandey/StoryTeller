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
}

export default function Home() {
  const [storyState, setStoryState] = useState<StoryState>({
    currentStory: '',
    choices: [],
    storyHistory: [],
    isLoading: false,
    hasStarted: false,
  });

  const handleStartStory = async (prompt: string) => {
    try {
      setStoryState(prev => ({ ...prev, isLoading: true, geminiError: undefined }));
      
      // Always use Gemini API for story generation
      const response = await fetch('/api/gemini-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
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
      
      // Always use Gemini API for story generation
      const response = await fetch('/api/gemini-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: choice,
          history: storyState.storyHistory 
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
        choices: data.choices,
        storyHistory: [...prev.storyHistory, { text: data.story, prompt: choice, image: data.storyImage }],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error continuing story:', error);
      setStoryState(prev => ({ ...prev, isLoading: false }));
      alert('Failed to continue story. Please try again.');
    }
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
            isLoading={storyState.isLoading}
            storyImage={storyState.currentImage}
          />
        )}
      </div>

      <footer>
        <p>&copy; {new Date().getFullYear()} AI Storytelling Adventure</p>
      </footer>
    </div>
  );
} 