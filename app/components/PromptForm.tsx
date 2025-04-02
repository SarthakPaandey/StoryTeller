'use client';

import React, { useState } from 'react';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  buttonText?: string;
}

const PromptForm: React.FC<PromptFormProps> = ({ 
  onSubmit, 
  isLoading, 
  buttonText = 'Submit'
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div>
        <textarea
          className="form-textarea"
          placeholder="Enter your story prompt here..."
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <button
        type="submit"
        className="submit-button"
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating your adventure...
          </>
        ) : (
          <>
            <span className="button-icon">✨</span>
            {buttonText}
          </>
        )}
      </button>
    </form>
  );
};

export default PromptForm; 