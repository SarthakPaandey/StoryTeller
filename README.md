# AI Storytelling Adventure

An interactive web-based storytelling game where AI generates a short story based on user prompts, and users can choose options to continue the story.

## Features

- **Story Generation**: Users input a prompt and the AI generates a short story snippet
- **Dual AI Models**: 
  - Basic mode with mock responses (no API key required)
  - Advanced mode with Google's Gemini AI for more creative and dynamic stories
- **Visual Storytelling**: 
  - Automatic image generation for each story segment based on content
  - Uses Unsplash API to find relevant images that match story keywords
- **Interactive Choices**: At the end of each story snippet, users can choose from 2-3 options to continue the story
- **Save & Share**: Users can save their story as a text file

## Tech Stack

- **Frontend**: Next.js with React
- **Styling**: Tailwind CSS
- **AI Integration**: 
  - Mock AI responses (no API key needed)
  - Google Gemini API integration for enhanced story generation
- **Image Generation**:
  - Unsplash API for high-quality, relevant images
  - Fallback to source.unsplash.com for when no API key is available
- **Storage**: Browser's LocalStorage for temporary state management

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- (Optional) Google Gemini API key for advanced story generation
- (Optional) Unsplash API key for high-quality image generation

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-storytelling-adventure.git
cd ai-storytelling-adventure
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Get your Unsplash API key from [Unsplash Developers](https://unsplash.com/developers)
   - Add both API keys to the `.env.local` file

```bash
cp .env.example .env.local
# Then edit .env.local with your API keys
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features Notes

- **Image Generation**: 
  - If you provide an Unsplash API key, the app will use the official API to find high-quality, relevant images
  - Without an API key, it will use the source.unsplash.com service as a fallback
  - Images are selected based on keywords extracted from the story content

## Future Enhancements

- Integration with other AI models (OpenAI, Claude, etc.)
- Image generation using DALL-E or Stable Diffusion for more tailored visuals
- User accounts to save story progress
- Social sharing capabilities
- Mobile app version
