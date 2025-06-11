import React from 'react';
import './Results.css';

function Results({ analysis }) { // The analysis prop contains the results of the SEO analysis, including readability score, keyword density, content length, and improvement tips.
  return (
    <div className="results">
      <h2>SEO Analysis Results</h2>
      
      <div className="metrics-card">
        <div className="metric">
          <h3>Readability Score</h3>
          <div className="score-display">
            <div className={`score-value ${getScoreClass(analysis.readabilityScore)}`}> {/* The score value is dynamically styled based on the readability score. */}
              {analysis.readabilityScore}
            </div>
            <div className="score-label">{getReadabilityLabel(analysis.readabilityScore)}</div>
          </div>
        </div> {/* The readability score is displayed with a dynamic class that indicates its quality, and a label that describes the readability level. */}
        
        <div className="metric">
          <h3>Keyword Density</h3>
          <div className="score-display">
            <div className={`score-value ${getKeywordDensityClass(analysis.keywordDensity)}`}>
              {analysis.keywordDensity}%
            </div>
          </div>
        </div>  { /* The keyword density is displayed with a dynamic class that indicates whether it is within the recommended range. */}
        
        <div className="metric">
          <h3>Content Length</h3>
          <div className="score-display">
            <div className="score-value">
              {analysis.wordCount} words
            </div>
            <div className="score-label">
              {getContentLengthLabel(analysis.wordCount)} {/* The content length is displayed with a label indicating its suitability for different types of content. */}
            </div>
          </div>
        </div>
      </div>
      
      <div className="improvement-tips">
        <h3>Optimization Tips</h3>
        <ul>
          {analysis.improvementTips.map((tip, index) => (
            <li key={index}>{tip}</li> 
          ))}
        </ul>
      </div>{ /* The improvement tips are displayed as a list, providing actionable suggestions for enhancing the content's SEO. */}
    </div>
  );
}

// Helper functions for display logic
function getScoreClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'poor';
}

function getReadabilityLabel(score) {
  if (score >= 80) return 'Very Easy to Read';
  if (score >= 60) return 'Easy to Read';
  if (score >= 40) return 'Fairly Difficult';
  return 'Difficult to Read';
}

function getKeywordDensityClass(density) {
  if (density >= 0.5 && density <= 2.5) return 'good';
  return 'warning';
}

function getContentLengthLabel(wordCount) {
  if (wordCount < 300) return 'Too short for most SEO purposes';
  if (wordCount >= 300 && wordCount < 600) return 'Good for social media';
  if (wordCount >= 600 && wordCount < 1200) return 'Good for blog posts';
  return 'Excellent for in-depth articles';
}

export default Results;