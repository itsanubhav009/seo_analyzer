const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// --- START CORS Configuration ---
// Allow any Vercel deployment of your project and localhost for dev
// the regex is used to match any subdomain of your Vercel project
//because Vercel deployments can have dynamic subdomains, we use regex to match them.
const allowedOrigins = [
  /^https:\/\/seo-analyzer-[a-z0-9-]+\.vercel\.app$/, // any vercel preview or production client (replace with your actual Vercel project pattern)
  /^https:\/\/seo-analyzer-one\.vercel\.app$/,         // your API production URL
  /^https:\/\/seo-analyzer-2b8f\.vercel\.app$/,        // your current client deployment
  /^http:\/\/localhost:\d+$/,                          // localhost for development
  /^http:\/\/127\.0\.0\.1:\d+$/,                       // 127.0.0.1 for dev
];

app.use((req, res, next) => { // Custom CORS middleware
  const origin = req.headers.origin; // get the origin of the request
  let allowed = false; // default to not allowed
  if (!origin) allowed = true; // allow server-to-server and curl calls
  else { 
    allowed = allowedOrigins.some((pattern) =>
      typeof pattern === 'string'
        ? pattern === origin
        : pattern.test(origin)
    ); // check if the origin matches any of the allowed patterns
  }
  if (allowed && origin) {
    res.header('Access-Control-Allow-Origin', origin); // set the allowed origin header
    res.header('Access-Control-Allow-Credentials', 'true');
  } // if the origin is allowed, set the Access-Control-Allow-Origin header
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS'); // set allowed methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept'); // set allowed headers
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  } // if the request is an OPTIONS preflight request, send 200 OK
  next(); // call the next middleware or route handler
});
// --- END CORS Configuration ---

app.use(express.json()); // Parse JSON request bodies

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SEO Analyzer API is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      test: '/api/test',
      analyze: '/api/analyze (POST)',
      health: '/health'
    }
  });
}); // This endpoint provides basic information about the API and available endpoints

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test endpoint working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main API endpoint for text analysis
app.post('/api/analyze', async (req, res) => {
  console.log('Received POST request to /api/analyze');
  console.log('Request body:', req.body);
  console.log('Origin:', req.headers.origin);
  
  const { text } = req.body; // Extract text from request body
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  } // If no text is provided, return a 400 Bad Request error
  
  try {
    // Send text to TextRazor API
    const textRazorResponse = await analyzeWithTextRazor(text); // Call the function to analyze text with TextRazor API
    
    // Process API response to extract keywords and analysis
    const processedData = processTextRazorResponse(textRazorResponse, text); // Process the TextRazor response to extract keywords and generate analysis
    
    return res.json(processedData); // Return the processed data as JSON response
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Fallback to mock data if TextRazor fails
    const fallbackData = generateMockAnalysis(text); // Generate mock analysis data if TextRazor API fails
    return res.json(fallbackData); // Return the mock analysis data as JSON response
  }
});

// GET version of analyze for testing
app.get('/api/analyze', (req, res) => {
  res.json({
    message: 'Use POST method to analyze text',
    example: {
      method: 'POST',
      url: '/api/analyze',
      body: { text: 'Your text here' }
    },
    timestamp: new Date().toISOString()
  });
});

// Function to analyze text with TextRazor API
async function analyzeWithTextRazor(text) {
  const API_KEY = process.env.TEXTRAZOR_API_KEY || '3e0aaae0f349c179fd484eba3073815034b74bbd6ff2c839ebde1dff'; // Replace with your actual TextRazor API key or set it in environment variables
  
  try { // Make sure to handle the API key securely, ideally using environment variables
    const response = await axios({
      method: 'post',
      url: 'https://api.textrazor.com/',
      headers: {
        'x-textrazor-key': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // Set headers for TextRazor API request
      data: new URLSearchParams({
        'text': text,
        'extractors': 'entities,topics,words,phrases,relations,entailments,senses'
      }), // Use URLSearchParams to format the data correctly for application/x-www-form-urlencoded
      timeout: 10000 // 10 second timeout this is to prevent long waits for API responses
    }); // Send POST request to TextRazor API with text and extractors
    
    return response.data; // Return the response data from TextRazor API
  } catch (error) {
    console.error('TextRazor API error:', error.message);
    throw new Error('Failed to analyze with TextRazor');
  } // If the TextRazor API request fails, log the error and throw an error to be caught in the main API endpoint
}

// Process the TextRazor response
function processTextRazorResponse(apiResponse, originalText) {
  const keywords = [];
  
  // Add entities as keywords
  if (apiResponse.response && apiResponse.response.entities) { // Check if the response contains entities
    apiResponse.response.entities.forEach(entity => {
      // Only add relevant entities with high confidence
      if (entity.relevanceScore > 0.5 && !keywords.some(k => k.text.toLowerCase() === entity.entityId.toLowerCase())) {
        keywords.push({ 
          text: entity.entityId,
          relevance: Math.round(entity.relevanceScore * 100)
        }); // Add entity to keywords if it has a high relevance score and is not already included
      } 
    });// Loop through each entity in the response and add it to the keywords array if it meets the criteria
  }
  
  // Add topics as keywords
  if (apiResponse.response && apiResponse.response.topics) {
    apiResponse.response.topics.forEach(topic => {
      if (topic.score > 0.5 && !keywords.some(k => k.text.toLowerCase() === topic.label.toLowerCase())) {
        keywords.push({
          text: topic.label,
          relevance: Math.round(topic.score * 100)
        }); // Add topic to keywords if it has a high score and is not already included
      }
    }); // Loop through each topic in the response and add it to the keywords array if it meets the criteria
  }
  
  // Sort keywords by relevance (highest first) and limit to top 10
  keywords.sort((a, b) => b.relevance - a.relevance); // Sort keywords in descending order based on relevance score
  const topKeywords = keywords.slice(0, 10); // Get top 10 keywords based on relevance score
  
  // Generate SEO analysis
  return generateAnalysis(originalText, topKeywords); 
}

// Generate mock analysis for fallback
function generateMockAnalysis(text) {
  const mockKeywords = [
    { text: 'SEO optimization', relevance: 95 },
    { text: 'content marketing', relevance: 88 },
    { text: 'search engine', relevance: 82 },
    { text: 'keyword research', relevance: 78 },
    { text: 'digital marketing', relevance: 75 }
  ];
  
  return generateAnalysis(text, mockKeywords);
}

// Generate analysis data
function generateAnalysis(originalText, keywords) {
  const wordCount = originalText.split(/\s+/).length; // Count words by splitting on whitespace
  
  // Calculate readability (simplified Flesch-Kincaid)
  const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0).length; // Count sentences by splitting on punctuation
  const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : wordCount; // Calculate average words per sentence
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 10) * 5)); // Calculate a simplified readability score based on average words per sentence
  
  // Calculate keyword density for top keywords
  let keywordDensity = 0; // Initialize keyword density
  if (keywords.length > 0) {
    const primaryKeyword = keywords[0].text.toLowerCase(); // Use the first keyword as the primary keyword for density calculation
    const regex = new RegExp(`\\b${primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'); // Create a regex to match the primary keyword, ensuring it matches whole words only
    const matches = originalText.match(regex) || []; // Find all matches of the primary keyword in the original text
    keywordDensity = parseFloat(((matches.length / wordCount) * 100).toFixed(2)); // Calculate keyword density as a percentage
  }
  
  // Generate improvement tips
  const improvementTips = [];
  
  if (readabilityScore < 60) {
    improvementTips.push('Consider using shorter sentences to improve readability.');
  }
  
  if (wordCount < 300) {
    improvementTips.push('Content is quite short. Adding more relevant content may improve SEO.');
  } else if (wordCount > 2000) {
    improvementTips.push('Content is quite long. Consider breaking it into smaller sections with headings.');
  }
  
  if (keywordDensity < 0.5) {
    improvementTips.push('Consider increasing the use of primary keywords (aim for 1-2%).');
  } else if (keywordDensity > 3) {
    improvementTips.push('Keyword density is too high, which may be seen as keyword stuffing.');
  }
  
  // Check for headings
  if (!originalText.includes('<h1>') && !originalText.includes('<h2>')) {
    improvementTips.push('Consider adding proper headings (H1, H2) to structure your content.');
  }
  
  // Check for links
  if (!originalText.includes('http') && !originalText.includes('<a')) {
    improvementTips.push('Adding relevant internal and external links can improve SEO.');
  }
  
  if (improvementTips.length === 0) {
    improvementTips.push('Your content looks good! Keep focusing on quality and relevance.');
  }
  
  return {
    keywords: keywords,
    analysis: {
      readabilityScore: Math.round(readabilityScore),
      keywordDensity,
      wordCount,
      improvementTips
    }
  }; // Return the analysis data including keywords and various metrics
  // The analysis includes readability score, keyword density, word count, and improvement tips based on the content
  // This function generates a comprehensive analysis of the text, including keyword suggestions and SEO improvement tips.
  // It returns an object containing the keywords and analysis data.
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Handle any other routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl,
    availableEndpoints: {
      root: 'GET /',
      test: 'GET /api/test',
      analyze: 'POST /api/analyze',
      health: 'GET /health'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server for local development
const PORT = process.env.PORT || 3001;

if (require.main === module) {
  // Only start server if this file is run directly (not imported)
  app.listen(PORT, () => {
    console.log(`🚀 SEO Analyzer API Server running on port ${PORT}`);
    console.log(`📡 Local URL: http://localhost:${PORT}`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    console.log(`💡 Health check: http://localhost:${PORT}/health`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
  });
}

// Export for Vercel
module.exports = app;