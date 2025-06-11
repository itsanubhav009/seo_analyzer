import React from 'react';
import './KeywordList.css';

function KeywordList({ keywords, onInsert }) {  // The keywords prop is an array of keyword objects, each containing a text and relevance score.
  return (
    <div className="keyword-list">
      <h2>Recommended Keywords</h2>
      
      {keywords.length === 0 ? (
        <p className="no-keywords">No keywords available</p>
      ) : (
        <ul>
          {keywords.map((keyword, index) => (
            <li key={index} className="keyword-item">
              <span className="keyword-text">{keyword.text}</span>
              <span className="keyword-relevance">Relevance: {keyword.relevance}%</span> {/* The relevance score indicates how relevant the keyword is to the content being analyzed. */}
              <button 
                className="insert-button"
                onClick={() => onInsert(keyword.text)} // The onInsert function is called when the user clicks the "Insert" button, passing the keyword text to the parent component for insertion into the content.
              >
                Insert
              </button>
            </li>
          ))}
        </ul>
      )}
      
      <div className="keyword-tips">
        <h3>Keyword Usage Tips</h3>
        <ul>
          <li>Use keywords naturally in your content</li>
          <li>Include keywords in headings where appropriate</li>
          <li>Aim for 1-2% keyword density for primary keywords</li>
          <li>Incorporate related terms and synonyms</li>
        </ul>
      </div>
    </div>
  );
}

export default KeywordList;