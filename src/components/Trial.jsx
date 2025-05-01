import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown'; // to render markdown responses
import './trial.css'
import TextareaAutosize from 'react-textarea-autosize';
import {isMobile} from 'react-device-detect';
import Modal from './Modal';
import { GoogleGenAI } from "@google/genai";

import { ListBox } from 'primereact/listbox';
import "primereact/resources/themes/lara-light-cyan/theme.css";

const key = process.env.REACT_APP_GEMINI_API_KEY
const genAI = new GoogleGenAI({ apiKey: key });

// const modelName = process.env.REACT_APP_GEMINI_MODEL_NAME;
// console.log(`Model name: ${modelName}`)

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
  const [youSaid, setYouSaid] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState(process.env.REACT_APP_GEMINI_MODEL_NAME);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModelName, setSelectedModelName] = useState(null);

  const [modelUsedInputWidth, setModelUsedInputWidth] = useState('auto');
  const modelUsedInputRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    if (!measureRef.current) return;
    measureRef.current.textContent = modelUsed;
    // setModelUsedInputWidth(measureRef.current.offsetWidth + 2); // Add some extra space
    setModelUsedInputWidth(measureRef.current.offsetWidth + 8); // Add some extra space
  }, [modelUsed]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const generateContent = async (prompt) => {
    const response = await genAI.models.generateContent({
      model: modelUsed,
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
    setYouSaid(userInput)
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
  let modelsList = [
    // { name: modelname, code: modelname },
  ];

  if ((modelsList.length === 0) && modelsData ) {
      modelsData.models.map((model) => {
        if (model.supportedGenerationMethods.includes('generateContent')) {
          modelsList.push({name: model.name, code: model.name})
        }
        return null
      })
  }
  

  return (
    <div className="trial-chat-container">
      <div className="trial-header-container">
        <h2>Gemini AI API Trial 2</h2> 
        <div className="models-used-container">
          <div style={{ display: 'inline-block' }}>
            <label htmlFor="modelUsedInput">Model Used: </label>
            <span
              style={{
                position: 'absolute',
                whiteSpace: 'nowrap',
                visibility: 'hidden',
                font: modelUsedInputRef.current ? getComputedStyle(modelUsedInputRef.current).font : null,
              }}
              ref={measureRef}
            >
              {modelUsed}
            </span>
            <input
              className="model-used-input"
              type="text"
              id="modelUsedInput"
              value={modelUsed}
              onChange={(e) => setModelUsed(e.target.value)}
              style={{ width: modelUsedInputWidth, minWidth: '10px' }}
              ref={modelUsedInputRef}
            />
          </div>
          <div>
          <button className="list-models-btn" onClick={openModal}>List</button>
          </div>
        </div>
        <div>
          <Modal isOpen={isModalOpen} onClose={closeModal} modelsData={modelsData}>
            <div className="models-list-content">
              <div className="models-list-header">
                <h3>Models with 'generateContent'</h3>
                <div>
                  <p className="modal-p">Model used now: {modelUsed}</p>
                  <p className="modal-p">Model selected: {selectedModelName?.name}</p>
                  <p className="modal-p">
                    <button className="set-selected-model-btn"
                      disabled={selectedModelName?.name && selectedModelName.name !== modelUsed ? false : true}
                      onClick={()=>selectedModelName?.name && setModelUsed(selectedModelName?.name)}>
                        Set selected model as model to use
                    </button>
                  </p>
                </div>
              </div>
              <div className="models-list">
                  <div className="card flex justify-content-center">  
                    <ListBox value={selectedModelName} onChange={(e) => setSelectedModelName(e.value)}
                    options={modelsList} optionLabel="name" className="w-full md:w-14rem" />
                  </div>
              </div>
              <div className="models-list-close">
                <button onClick={closeModal}>Close</button>
              </div>
            </div>
          </Modal>
        </div>
        <div className="trial-input-container">
          <TextareaAutosize
          type="text"
          value={userInput}
          onChange={handleUserInput}
          onKeyDown={isMobile ? undefined : handleKeyPress}
          placeholder="Type your message here..."
          className="trial-input"
          disabled = {isLoading ? true : false}
          maxRows={10}
          />
          <div>
          <button onClick={handleSubmit} className="send-btn">
              Send
          </button>
          </div>
        </div>
        {youSaid && <p className="message message-user">{youSaid}</p>}
        {isLoading && <p className="loading-text">Generating response...</p>}
      </div>
      <div className="trial-chat-response">
        { !isLoading && response ?
        <div className="message message-bot">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
        : null
        }
      </div>
    </div>
  )
}

export default Trial