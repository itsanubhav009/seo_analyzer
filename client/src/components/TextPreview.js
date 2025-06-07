import React from 'react';
import './TextPreview.css';

function TextPreview({ text }) {
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
}

export default TextPreview;