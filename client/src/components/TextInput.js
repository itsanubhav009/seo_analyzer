import React, { useState } from 'react';
import './TextInput.css';

function TextInput({ onSubmit }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <div className="text-input">
      <h2>Enter your text</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your blog post, article, or social media content here..."
          rows={10}
          required
        />
        <button type="submit" className="submit-button">
          Analyze for SEO
        </button>
      </form>
    </div>
  );
}

export default TextInput;