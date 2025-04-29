import React, { useState } from "react";
import ReactMarkdown from 'react-markdown'; // to render markdown responses
import './trial.css'
import TextareaAutosize from 'react-textarea-autosize';
import {isMobile} from 'react-device-detect';
import Modal from './Modal';
import { GoogleGenAI } from "@google/genai";
// import { GoogleGenerativeAI } from '@google/genai';
const key = process.env.REACT_APP_GEMINI_API_KEY
const genAI = new GoogleGenAI({ apiKey: key });
// const genAI = new GoogleGenerativeAI(key);
// const modelName = process.env.REACT_APP_GEMINI_MODEL_NAME;
// console.log(`Model name: ${modelName}`)


// async function listAvailableModels() {
//   try {
//     const modelList = await genAI.listModels();
//     console.log("Available models:", modelList.models);
//   } catch (error) {
//     console.error("Error fetching models:", error);
//   }
// }

let modelsData
async function listAvailableModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  console.log(`listAvailableModels url: ${url}`)

  let data;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
    }

    data = await response.json();
  } catch (error) {
    console.error("Fetching data failed:", error);
  }
  console.log("Available models:", data);
  modelsData = data
  return data;
}

listAvailableModels();

function Trial() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState(process.env.REACT_APP_GEMINI_MODEL_NAME);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const generateContent = async (prompt) => {
    const response = await genAI.models.generateContent({
      model: modelUsed,
      // model: modelName,
      contents: prompt,
    });
    console.log(response.text);
    return response.text; // return the response
  }

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setResponse("Please enter a prompt.." );
      return;
    }

    setResponse('');
    setIsLoading(true);
    try {
      const res = await generateContent(userInput);
      setResponse(res);
      setUserInput('');
    } catch (err) {
      console.error("Error generating response:", err);
      setResponse(`Failed to generate response. Error message received from Gemini: ${err?.message}`);
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
  // console.log (`isMobile = ${isMobile}`)
  return (
    <div className="chat-container">
        <h1>Gemini AI API Trial Test</h1> 
        {/* <h2>Model used: {process.env.REACT_APP_GEMINI_MODEL_NAME}</h2> */}
        <div>
          Name of model being used:&nbsp; 
          <input type="text"
            value={modelUsed}
            onChange={(e)=>setModelUsed(e.target.value)}
            size="40"
            // className="chat-input"
            // disabled = {isLoading ? true : false}
           />
           <div>
          <span> To change model being used, specify name of model in above field. </span>
          <button onClick={openModal} style={{marginLeft: '10px'}}>List of available models</button>
          </div>
        </div>
        <div>
          <Modal isOpen={isModalOpen} onClose={closeModal} modelsData={modelsData}>
          <h2>Available models that support 'generateContent'</h2>
            {modelsData ? 
              <ul className="models-list">
                {modelsData.models.map((model) => {
                  return (model.supportedGenerationMethods.includes('generateContent') ?
                  <li key={model.name}>Name: {model.name},&nbsp;Display Name: {model.displayName}</li>
                  :
                  null )
                })}
              </ul>
              : null 
            }
            <button onClick={closeModal}>Close</button>
          </Modal>
        </div>
        {/* <h2>Model used: {process.env.REACT_APP_GEMINI_MODEL_NAME}</h2> */}
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
        </div>
          {/* {modelsData ? 
            <div>
            <h3>Available models that support 'generateContent'</h3>
            <ul>
              {modelsData.models.map((model) => {
                return (model.supportedGenerationMethods.includes('generateContent') ?
                <li key={model.name}>Name: {model.name},&nbsp;Display Name: {model.displayName}</li>
                :
                null )
              })}
            </ul>
          </div>
          : null } */}
    </div>
  )
}

export default Trial