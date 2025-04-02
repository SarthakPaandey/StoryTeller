'use client';

import React from 'react';

interface StoryProgress {
  current: number;
  max: number;
  isEnding: boolean;
}

interface StoryContainerProps {
  story: string;
  choices: string[];
  onChoiceSelect: (choice: string) => void;
  onSaveStory: () => void;
  onRestartStory: () => void;
  isLoading: boolean;
  storyImage?: string;
  storyProgress: StoryProgress;
}

const StoryContainer: React.FC<StoryContainerProps> = ({
  story,
  choices,
  onChoiceSelect,
  onSaveStory,
  onRestartStory,
  isLoading,
  storyImage,
  storyProgress,
}) => {
  // Split story into paragraphs for better readability
  const paragraphs = story.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="story-container">
      {/* Progress bar */}
      <div className="progress-container mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-500">{storyProgress.current} of {storyProgress.max} scenes</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(storyProgress.current / storyProgress.max) * 100}%` }}
          ></div>
        </div>
      </div>

      {storyImage && (
        <div className="story-image-container">
          <img
            src={storyImage}
            alt="Story illustration"
            className="story-image"
            onError={(e) => {
              // If image fails to load, hide the container
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              (target.parentNode as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="story-text mb-8">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="story-paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      {storyProgress.isEnding ? (
        <div className="story-ending">
          <h3 className="ending-title">Story Complete</h3>
          <p className="ending-text">You've reached the end of your adventure!</p>
          <div className="ending-actions">
            <button onClick={onSaveStory} className="save-button">
              Save Story
            </button>
            <button onClick={onRestartStory} className="restart-button">
              Start New Adventure
            </button>
          </div>
        </div>
      ) : (
        <div className="choices-container">
          {choices.length > 0 ? (
            <>
              <h3 className="choices-title">What happens next?</h3>
              
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Generating story...</span>
                </div>
              ) : (
                <div className="choices-list">
                  {choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => onChoiceSelect(choice)}
                      disabled={isLoading}
                      className={`choice-button ${
                        choice.toLowerCase().includes('conclude') 
                          ? 'choice-button-conclude'
                          : index === 0
                          ? 'choice-button-primary'
                          : index === 1
                          ? 'choice-button-secondary'
                          : 'choice-button-accent'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="story-actions mt-8">
              <button
                onClick={onSaveStory}
                className="save-button"
              >
                Save Story
              </button>
              <button
                onClick={onRestartStory}
                className="restart-button ml-4"
              >
                Start New Adventure
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryContainer; 