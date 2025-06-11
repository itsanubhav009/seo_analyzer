import React, { useState } from 'react';
import './TextInput.css';

function TextInput({ onSubmit }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior 
    if (text.trim()) {
      onSubmit(text); // Call the onSubmit function passed from the parent component with the text input
    }
  };

  return (
    <div className="text-input">
      <h2>Enter your text</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)} // Update the text state as the user types
          placeholder="Paste your blog post, article, or social media content here..."
          rows={10}
          required
        /> 
        {/*after the user enters the text, it will be submitted to the parent component for analysis. */}
        <button type="submit" className="submit-button">
          Analyze for SEO
        </button> {/* This button submits the form and triggers the onSubmit function with the entered text */}
      </form>
    </div>
  );
}

export default TextInput;