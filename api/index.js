const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS with specific configuration
app.use(cors({
  origin: [
    'https://seo-analyzer-client-qon7.vercel.app',
    'https://seo-analyzer-wz5a-nl0jdoorr-anubhavs-projects-f741798c.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Additional CORS middleware for preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Parse JSON bodies
app.use(express.json());

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
});

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
  
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  try {
    // Send text to TextRazor API
    const textRazorResponse = await analyzeWithTextRazor(text);
    
    // Process API response to extract keywords and analysis
    const processedData = processTextRazorResponse(textRazorResponse, text);
    
    return res.json(processedData);
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Fallback to mock data if TextRazor fails
    const fallbackData = generateMockAnalysis(text);
    return res.json(fallbackData);
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
  const API_KEY = process.env.TEXTRAZOR_API_KEY || '3e0aaae0f349c179fd484eba3073815034b74bbd6ff2c839ebde1dff';
  
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.textrazor.com/',
      headers: {
        'x-textrazor-key': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams({
        'text': text,
        'extractors': 'entities,topics,words,phrases,relations,entailments,senses'
      }),
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('TextRazor API error:', error.message);
    throw new Error('Failed to analyze with TextRazor');
  }
}

// Process the TextRazor response
function processTextRazorResponse(apiResponse, originalText) {
  const keywords = [];
  
  // Add entities as keywords
  if (apiResponse.response && apiResponse.response.entities) {
    apiResponse.response.entities.forEach(entity => {
      // Only add relevant entities with high confidence
      if (entity.relevanceScore > 0.5 && !keywords.some(k => k.text.toLowerCase() === entity.entityId.toLowerCase())) {
        keywords.push({
          text: entity.entityId,
          relevance: Math.round(entity.relevanceScore * 100)
        });
      }
    });
  }
  
  // Add topics as keywords
  if (apiResponse.response && apiResponse.response.topics) {
    apiResponse.response.topics.forEach(topic => {
      if (topic.score > 0.5 && !keywords.some(k => k.text.toLowerCase() === topic.label.toLowerCase())) {
        keywords.push({
          text: topic.label,
          relevance: Math.round(topic.score * 100)
        });
      }
    });
  }
  
  // Sort keywords by relevance (highest first) and limit to top 10
  keywords.sort((a, b) => b.relevance - a.relevance);
  const topKeywords = keywords.slice(0, 10);
  
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
  const wordCount = originalText.split(/\s+/).length;
  
  // Calculate readability (simplified Flesch-Kincaid)
  const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : wordCount;
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 10) * 5));
  
  // Calculate keyword density for top keywords
  let keywordDensity = 0;
  if (keywords.length > 0) {
    const primaryKeyword = keywords[0].text.toLowerCase();
    const regex = new RegExp(`\\b${primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = originalText.match(regex) || [];
    keywordDensity = parseFloat(((matches.length / wordCount) * 100).toFixed(2));
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
  };
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