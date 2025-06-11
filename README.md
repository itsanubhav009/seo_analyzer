# SEO Analyzer - AI-Powered Content Optimization

SEO Analyzer is a comprehensive web application that uses AI to analyze text content and provide actionable SEO recommendations. It helps content creators optimize their text for better search engine visibility by analyzing readability, keyword density, and other important SEO factors.

## Live Demo

[https://seo-analyzer-2b8f.vercel.app/](https://seo-analyzer-2b8f.vercel.app/)

![SEO Analyzer Screenshot](screenshot.png)

## Features

- **AI-Powered Text Analysis**: Analyzes your content using TextRazor's advanced natural language processing
- **Readability Assessment**: Calculates readability scores to ensure your content is accessible to your target audience
- **Keyword Extraction**: Identifies relevant keywords from your content for better SEO targeting
- **Keyword Density Analysis**: Measures keyword frequency to help avoid keyword stuffing
- **Content Length Evaluation**: Assesses if your content meets recommended length for different content types
- **SEO Improvement Tips**: Provides actionable recommendations to enhance your content's search visibility
- **Optimized Text Preview**: Shows how your content looks with suggested keywords inserted

## Technology Stack

### Frontend
- React.js
- CSS for styling
- Deployed on Vercel

### Backend
- Node.js
- Express.js
- TextRazor API for natural language processing
- Deployed on Vercel

## Project Structure

```
seo_analyzer/
├── api/                   # Backend API
│   ├── index.js           # Main Express server file
│   ├── package.json       # Backend dependencies
│   └── vercel.json        # Vercel configuration for API
│
├── client/                # Frontend React application
│   ├── public/            # Public assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   │   ├── KeywordList.js    # Displays suggested keywords
│   │   │   ├── Results.js        # Shows analysis results
│   │   │   ├── TextInput.js      # Handles text submission
│   │   │   └── TextPreview.js    # Displays optimized text
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Entry point
│   ├── .env               # Environment variables
│   └── package.json       # Frontend dependencies
```

## How It Works

1. **Text Input**: Users enter their content in the text input area
2. **AI Analysis**: The application sends the text to the backend API for analysis
3. **Keyword Extraction**: The system identifies relevant keywords using TextRazor's NLP capabilities
4. **Content Evaluation**: Metrics like readability, keyword density, and word count are calculated
5. **Recommendations**: The system generates SEO improvement tips based on the analysis
6. **Keyword Insertion**: Users can insert suggested keywords into their content
7. **Optimized Preview**: A preview of the optimized content is displayed for the user to copy

## API Endpoints

- `GET /api/test`: Test endpoint to verify API functionality
- `POST /api/analyze`: Main endpoint for text analysis
- `GET /health`: Health check endpoint

## Local Development

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Backend Setup

```bash
# Navigate to the API directory
cd api

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

### Environment Configuration

Create a `.env` file in the client directory with:

```
REACT_APP_API_URL=http://localhost:3001
```

## Deployment

The application is deployed on Vercel:

- Frontend: [https://seo-analyzer-2b8f.vercel.app/](https://seo-analyzer-2b8f.vercel.app/)
- Backend API: Deployed as a serverless function

## Technical Implementation Details

- **CORS Configuration**: Carefully configured to allow cross-origin requests between the client and API
- **Error Handling**: Graceful fallback to mock data if the external API is unavailable
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Performance Optimization**: Efficient text processing algorithms for quick analysis

## Future Enhancements

- User accounts for saving analysis history
- Competitor analysis features
- PDF and document upload support
- Integration with content management systems
- Enhanced analytics with visualization
