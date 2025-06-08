import React, { useState } from 'react';
import TextInput from './components/TextInput';
import Results from './components/Results';
import KeywordList from './components/KeywordList';
import TextPreview from './components/TextPreview';
import './App.css';

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [inputText, setInputText] = useState('');
  const [seoResults, setSeoResults] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewText, setPreviewText] = useState('');

  const handleTextSubmit = async (text) => {
    setInputText(text);
    setPreviewText(text);
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Making API request to:', `${API_BASE_URL}/api/analyze`);
      
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      setSeoResults(data.analysis);
      setKeywords(data.keywords || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error:', err);
      
      // Fallback to mock data
      console.log('Using fallback mock data');
      const mockData = generateMockAnalysis(text);
      setSeoResults(mockData.analysis);
      setKeywords(mockData.keywords || []);
      setError(`API unavailable - using offline analysis (${err.message})`);
      setIsLoading(false);
    }
  };

  // Mock analysis function for fallback
  const generateMockAnalysis = (text) => {
    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : wordCount;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 10) * 5));
    const keywordDensity = Math.round((wordCount * 0.02) * 10) / 10;

    const improvementTips = [];
    if (readabilityScore < 60) improvementTips.push('Consider using shorter sentences to improve readability.');
    if (wordCount < 300) improvementTips.push('Content is quite short. Adding more relevant content may improve SEO.');
    if (keywordDensity < 0.5) improvementTips.push('Consider increasing the use of primary keywords (aim for 1-2%).');
    improvementTips.push('Add proper headings (H1, H2) to structure your content.');
    improvementTips.push('Include relevant internal and external links.');

    return {
      analysis: {
        readabilityScore: Math.round(readabilityScore),
        keywordDensity,
        wordCount,
        improvementTips: improvementTips.length ? improvementTips : ['Your content looks good!']
      },
      keywords: [
        { text: 'SEO optimization', relevance: 95 },
        { text: 'content marketing', relevance: 88 },
        { text: 'search engine', relevance: 82 },
        { text: 'keyword research', relevance: 78 },
        { text: 'digital marketing', relevance: 75 },
        { text: 'web content', relevance: 70 }
      ]
    };
  };

  const insertKeyword = (keyword) => {
    const sentences = previewText.split('. ');
    
    for (let i = 0; i < sentences.length; i++) {
      if (!sentences[i].toLowerCase().includes(keyword.toLowerCase())) {
        const words = sentences[i].split(' ');
        if (words.length > 5) {
          const insertPosition = Math.min(3, Math.floor(words.length / 3));
          words.splice(insertPosition, 0, keyword);
          sentences[i] = words.join(' ');
          break;
        }
      }
    }
    
    const updatedText = sentences.join('. ');
    setPreviewText(updatedText);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>SEO Text Analyzer</h1>
        <p>AI-powered content analysis for better search engine visibility</p>
        <div className="api-status">
          <small>API: {API_BASE_URL}</small>
        </div>
      </header>
      
      <main className="app-main">
        <div className="input-section">
          <TextInput onSubmit={handleTextSubmit} />
          {!inputText && !isLoading && (
            <div className="instructions">
              <p>Enter your text above to get AI-powered SEO analysis and recommendations.</p>
            </div>
          )}
        </div>
        
        {isLoading && (
          <div className="loading">
            <p>Analyzing your text with AI...</p>
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <button 
              onClick={() => handleTextSubmit(inputText || previewText)} 
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        )}
        
        {seoResults && (
          <div className="results-section">
            <div className="results-container">
              <Results analysis={seoResults} />
            </div>
            
            <div className="keywords-preview-container">
              <div className="keywords-container">
                <KeywordList keywords={keywords} onInsert={insertKeyword} />
              </div>
              
              <div className="preview-container">
                <TextPreview text={previewText} />
                <div className="preview-actions">
                  <button 
                    onClick={() => handleTextSubmit(previewText)}
                    className="reanalyze-button"
                  >
                    Re-analyze
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewText);
                      alert('Text copied to clipboard!');
                    }}
                    className="copy-button"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>2025-06-08 04:13:37 | User: itsanubhav009 | Powered by TextRazor AI</p>
      </footer>
    </div>
  );
}

export default App;