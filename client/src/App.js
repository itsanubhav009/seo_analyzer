import React, { useState } from 'react';
import TextInput from './components/TextInput';
import Results from './components/Results';
import KeywordList from './components/KeywordList';
import TextPreview from './components/TextPreview';
import './App.css';

// Get API URL from environment variable with proper fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://seo-analyzer-client-cts9-nmy1jtisg-anubhavs-projects-f741798c.vercel.app';

function App() {
  const [inputText, setInputText] = useState(''); // used to put input data in the text input field
  const [seoResults, setSeoResults] = useState(null);//seoResults is used to store the analysis results from the API
  const [keywords, setKeywords] = useState([]);//keywords is used to store the list of keywords returned by the API
  const [isLoading, setIsLoading] = useState(false);//isLoading is used to show the loading state while the API request is being processed
  const [error, setError] = useState('');//error is used to show any error messages if the API request fails
  const [previewText, setPreviewText] = useState('');// previewText is used to show the text in the preview section after inserting keywords
  const handleTextSubmit = async (text) => {
    setInputText(text);// Set the input text to the state for re-rendering
    setPreviewText(text);// Set the preview text to the state for showing in the preview section
    setIsLoading(true);// Set loading state to true while making the API request
    setError('');// Reset any previous error messages
    
    try {
      // Construct URL properly - remove trailing slash and ensure proper path
      const apiUrl = `${API_BASE_URL.replace(/\/+$/, '')}/api/analyze`; // Ensure no double slashes
      console.log('Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ text }),
      }); // Send the text as JSON in the request body  
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json(); // Parse the JSON response from the API that contains the analysis results 
      console.log('API Response:', data);
      
      setSeoResults(data.analysis); // Set the analysis results in the state for rendering
      setKeywords(data.keywords || []); // Set the keywords in the state for rendering
      setIsLoading(false); // Set loading state to false after the API request is complete
    } catch (err) {
      console.error('Error:', err);
      
      // Fallback to mock data
      console.log('Using fallback mock data');
      const mockData = generateMockAnalysis(text);
      setSeoResults(mockData.analysis);
      setKeywords(mockData.keywords || []);
      setError(`API unavailable - using offline analysis (${err.message})`);
      setIsLoading(false);
    } // if the API request fails, use the mock analysis function to generate results
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
  }; // This function generates mock analysis data for fallback purposes and there is some logic to calculate readability score, keyword density, and improvement tips based on the input text.

  const insertKeyword = (keyword) => {
    const sentences = previewText.split('. '); // Split the preview text into sentences for insertion
    
    for (let i = 0; i < sentences.length; i++) {
      if (!sentences[i].toLowerCase().includes(keyword.toLowerCase())) {
        const words = sentences[i].split(' '); // Split the sentence into words to find a suitable insertion point
        if (words.length > 5) {
          const insertPosition = Math.min(3, Math.floor(words.length / 3)); // Insert the keyword at a position that maintains natural flow, e.g., after the first few words
          words.splice(insertPosition, 0, keyword); // Insert the keyword at the calculated position
          sentences[i] = words.join(' '); // Join the words back into a sentence
          break; // Exit the loop after inserting the keyword to avoid multiple insertions
        }
      }
    }
    
    const updatedText = sentences.join('. ');
    setPreviewText(updatedText);
  }; // This function inserts the selected keyword into the preview text at a suitable position, ensuring it doesn't disrupt the flow of the content. It splits the preview text into sentences, checks if the keyword is already present, and inserts it at an appropriate position if not.

  return (
    <div className="app">
      <header className="app-header">
        <h1>SEO Text Analyzer</h1>
        <p>AI-powered content analysis for better search engine visibility</p>
        <div className="api-status">
          <small>API: {API_BASE_URL}</small>
          <small style={{ marginLeft: '10px', color: '#28a745' }}>
            Status: {process.env.NODE_ENV || 'development'}Add commentMore actions
          </small>
        </div>
      </header>
      <main className="app-main">
        <div className="input-section">
          <TextInput onSubmit={handleTextSubmit} /> {/* This component handles the text input from the user and submits it for analysis */}
          {!inputText && !isLoading && (
            <div className="instructions">
              <p>Enter your text above to get AI-powered SEO analysis and recommendations.</p>
            </div>
          )}
        </div> {/* This section contains the text input component where users can enter their content for analysis. andit will perfom on */}
        
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
        
        {seoResults && ( // This section displays the SEO analysis results and allows users to interact with keywords and preview text.
          <div className="results-section">
            <div className="results-container">
              <Results analysis={seoResults} />
            </div> {/* This component displays the SEO analysis results, including readability score, keyword density, word count, and improvement tips. */}
            
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
                </div> {/* This component displays the optimized text preview after keyword insertion and allows users to copy the optimized text to the clipboard. */}
              </div>
            </div>
          </div>
        )}
      </main>
      
     
    </div>
  );
}

export default App;