import React, { useState } from "react";
import ReactMarkdown from 'react-markdown'; // to render markdown responses
import './trial.css'
import TextareaAutosize from 'react-textarea-autosize';
import {isMobile} from 'react-device-detect';

const { GoogleGenerativeAI } = require("@google/generative-ai");
const key = process.env.REACT_APP_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(key);
const modelName = process.env.REACT_APP_GEMINI_MODEL_NAME;
console.log(`Model name: ${modelName}`)
const model = genAI.getGenerativeModel({ model: modelName });

const generateContent = async (prompt) => {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text; // return the response
}

function Trial() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setResponse("Please enter a prompt.." );
      return;
    }

    setIsLoading(true);
    try {
      const res = await generateContent(userInput);
      setResponse(res());
      setUserInput('');
    } catch (err) {
      console.error("Error generating response:", err);
      setResponse("Failed to generate response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    // Chrome on Android does not seem to set e.ShiftKey correctly. So if on mobile, ignore all keys including Enter
    // User has to tap Send button to send message to Gemini.
    // The event handler itself will not be set. But the code below plays safe.
    if (isMobile) {
      return
    }
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };
  console.log (`isMobile = ${isMobile}`)
  return (
    <div className="chat-container">
        <h1>Gemini AI API Trial Test</h1> 
        <h2>Model used: {process.env.REACT_APP_GEMINI_MODEL_NAME}</h2>
        <div className="trial-input-container">
            <TextareaAutosize
            type="text"
            value={userInput}
            onChange={handleUserInput}
            onKeyDown={isMobile ? undefined : handleKeyPress}
            placeholder="Type your message here..."
            className="chat-input"
            disabled = {isLoading ? true : false}
            maxRows={10}
            />
            <div>
            <button onClick={handleSubmit} className="send-btn">
                Send
            </button>
            </div>
        </div>
        {isLoading && <p className="loading-text">Generating response...</p>}
        <div className="trial-chat-response">
            <ReactMarkdown>{response}</ReactMarkdown>
            {/* {isLoading && <p className="loading-text">Generating response...</p>} */}
        </div>
    </div>
  )
}

export default Trial