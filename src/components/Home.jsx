import React, { useState } from "react";
import { IoIosSend } from "react-icons/io";
import { generateContent } from './Model'; 
import ReactMarkdown from 'react-markdown'; // to render markdown responses
import './home.css'
import TextareaAutosize from 'react-textarea-autosize';
import {isMobile} from 'react-device-detect';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleClear = () => {
    setUserInput('');
    setResponse([]);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setResponse([{ type: "system", message: "Please enter a prompt.." }]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await generateContent(userInput);
      setResponse(prevResponse => [
        ...prevResponse,
        { type: "user", message: userInput },
        { type: "bot", message: res()},
      ]);
      setUserInput('');
    } catch (err) {
      console.error("Error generating response:", err);
      setResponse(prevResponse => [
        ...prevResponse,
        { type: "system", message: "Failed to generate response" },
      ]);
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
  const escapedNewLineToLineBreakTag = (string) => {
    const x = string.split('\n').map((item, index) => {
      return (index === 0) ? item : [<br key={index} />, item]
    })
    // console.log(x)
    return x;
  }

  return (
    <div className="chat-container">
      {response.length === 0 ? (
        <div> 
        <h1>Gemini AI API Trial</h1> 
        <h2>Model used: {process.env.REACT_APP_GEMINI_MODEL_NAME}</h2>
        <p className="attribution">This simple trial app is based on the article:&nbsp; 
          <a href="https://dev.to/tahrim_bilal/how-to-integrate-gemini-api-with-reactjs-a-step-by-step-guide-341b">
          How to Integrate Gemini API with React.js: A Step-by-Step Guide.</a> Many thanks to the author and publisher of the article. 
        </p>
        {isLoading && <p className="loading-text">Generating response...</p>}
        </div>
      ) : (
        <div className="chat-history">
          {response.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.type === "user" ? escapedNewLineToLineBreakTag(msg.message) : <ReactMarkdown>{msg.message}</ReactMarkdown>}
            </div>
          ))}
          {isLoading && <p className="loading-text">Generating response...</p>}
        </div>
      )}

      <div className="clear-btn-container">
                <button onClick={handleClear} className="clear-btn">Clear chat</button>
      </div>
      <div className="input-container">
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
          <IoIosSend />
        </button>
        </div>
      </div>
    </div>
  );
}