'use client';

import React from 'react';

interface StoryContainerProps {
  story: string;
  choices: string[];
  onChoiceSelect: (choice: string) => void;
  onSaveStory: () => void;
  isLoading: boolean;
  storyImage?: string;
}

const StoryContainer: React.FC<StoryContainerProps> = ({
  story,
  choices,
  onChoiceSelect,
  onSaveStory,
  isLoading,
  storyImage,
}) => {
  // Split story into paragraphs for better readability
  const paragraphs = story.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="story-container">
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

      <div className="choices-container">
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
                  index === 0
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
      </div>

      <div className="story-actions">
        <button
          onClick={onSaveStory}
          className="save-button"
        >
          Save Story
        </button>
      </div>
    </div>
  );
};

export default StoryContainer; 