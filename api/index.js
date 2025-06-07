const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle OPTIONS requests explicitly
app.options('*', cors());

app.use(bodyParser.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString() 
  });
});

// Analyze endpoint
app.post('/api/analyze', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  // Mock response for testing
  const processedData = {
    keywords: [
      { text: "Example Keyword", relevance: 95 },
      { text: "SEO", relevance: 90 }
    ],
    analysis: {
      readabilityScore: 85,
      keywordDensity: 2.1,
      wordCount: text.split(/\s+/).length,
      improvementTips: ["This is a test response to verify API connectivity"]
    }
  };
  
  return res.json(processedData);
});

// Export for serverless
module.exports = app;