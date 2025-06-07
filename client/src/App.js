import React, { useState } from 'react';
import TextInput from './components/TextInput';
import Results from './components/Results';
import KeywordList from './components/KeywordList';
import TextPreview from './components/TextPreview';
import './App.css';

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
      console.log('Making API request...');
      
      const response = await fetch('/api/analyze', {
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
      setError(`Failed to analyze text: ${err.message}`);
      setIsLoading(false);
    }
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
        <h1>SEO Text Optimizer</h1>
        <p>Analyze and optimize your content for better search engine visibility</p>
      </header>
      
      <main className="app-main">
        <div className="input-section">
          <TextInput onSubmit={handleTextSubmit} />
          {!inputText && !isLoading && (
            <div className="instructions">
              <p>Enter your text above to get SEO analysis and recommendations.</p>
            </div>
          )}
        </div>
        
        {isLoading && (
          <div className="loading">
            <p>Analyzing your text...</p>
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
        <p>SEO Text Optimizer | User: itsanubhav009</p>
      </footer>
    </div>
  );
}

export default App;