import React from 'react';
import './TextPreview.css';

function TextPreview({ text }) { {/* // The text prop is passed from the parent component, which contains the optimized content after keyword insertion.
*/}
  return (
    <div className="text-preview">
      <h2>Optimized Text Preview</h2>
      <div className="preview-content">
        {text || "Your optimized text will appear here after you add keywords."}
      </div>
      <div className="preview-controls">
        <button className="copy-button" onClick={() => navigator.clipboard.writeText(text)}>
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
} // This component displays the optimized text preview after keyword insertion.
// It allows users to copy the optimized text to the clipboard for easy use in their content management systems or social media platforms.

export default TextPreview;