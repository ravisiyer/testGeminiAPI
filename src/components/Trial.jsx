import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown'; // to render markdown responses
import './Trial.css'
import TextareaAutosize from 'react-textarea-autosize';
import {isMobile} from 'react-device-detect';
import Modal from './Modal';
import { GoogleGenAI } from "@google/genai";

import { ListBox } from 'primereact/listbox';
import "primereact/resources/themes/lara-light-cyan/theme.css";

const key = process.env.REACT_APP_GEMINI_API_KEY
const genAI = new GoogleGenAI({ apiKey: key });

function Trial() {
  const [userInput, setUserInput] = useState('');
  const [youSaid, setYouSaid] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState(process.env.REACT_APP_GEMINI_MODEL_NAME);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModelName, setSelectedModelName] = useState(null);
  const [modelsList, setModelsList] = useState([])
  const defaultChatContainerWidth = process.env.REACT_APP_DEFAULT_CHAT_CONTAINER_WIDTH ?
     process.env.REACT_APP_DEFAULT_CHAT_CONTAINER_WIDTH : "800px"
  const [chatContainerWidth, setChatContainerWidth] = useState(defaultChatContainerWidth);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [modelUsedInputWidth, setModelUsedInputWidth] = useState('auto');
  const modelUsedInputRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); 

  useEffect(()=>{
    async function listAvailableModels() {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      // console.log(`listAvailableModels url: ${url}`) Exposes APIkey on browser console!
      // ... So use only while debugging
    
      let data;
      try {
        const response = await fetch(url);
    
        // For testing
        // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        // await(delay(6000)); // 1 minute = 60000 ms; 6000 ms = 6 secs
    
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
        }
    
        data = await response.json();
      } catch (error) {
        console.error("Fetching data failed:", error);
      }
      console.log("Available models:", data);
      let modelsListTmp = []
      if (data?.models?.length) {
        data.models.map((model) => {
          if (model.supportedGenerationMethods.includes('generateContent')) {
            modelsListTmp.push({name: model.name, code: model.name})
          }
          return null
        })
        setModelsList(modelsListTmp);
      }
    }
   
    listAvailableModels();
  },[])

  useEffect(() => {
    if (!measureRef.current) return;
    measureRef.current.textContent = modelUsed;
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
    console.log(response?.text);
    if (response?.text) {
      return response.text; // return the response
    } else {
      return "Gemini did not give any response text but did not raise an error!"
    }
  }

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setYouSaid('');
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

  const handleToggleFullScreen = (e) => {
    if (chatContainerWidth === "100vw" ) {
      setChatContainerWidth(defaultChatContainerWidth)
    } else {
      setChatContainerWidth("100vw")
    }
  }
  
  const isWindowWiderThanDefaultCCWidth = () => {
    const intDefaultChatContainerWidth = parseInt(defaultChatContainerWidth);
    if (intDefaultChatContainerWidth) {
      // console.log(`windowWidth: ${windowWidth}`)
      // console.log(`intDefaultChatContainerWidth: ${intDefaultChatContainerWidth}`)
      return (windowWidth > intDefaultChatContainerWidth)
    }
    // console.log(`parseInt gave 0 or NaN for defaultChatContainerWidth: ${defaultChatContainerWidth}`)
    return false; // safe value
  }

  return (
    <div className="trial-chat-container" style={{maxWidth: `${chatContainerWidth}`}}>
      <div className="trial-header-container">
        <div className="trial-header-row">
          <h2>Gemini AI API 2nd Trial</h2>
          <div> {isWindowWiderThanDefaultCCWidth() ? 
                  <button className="toggle-full-width-btn"
                    onClick={handleToggleFullScreen}>
                    {chatContainerWidth === "100vw" ? "Normal width" : "Full width" }
                  </button>
                  : 
                  null }
          </div>
        </div>
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
            <button className="list-models-btn" onClick={openModal}
            disabled={!(modelsList?.length)}>
              List
            </button>
          </div>
        </div>
        <div>
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="models-list-content">
              <div className="models-list-header">
                <h3>Models with 'generateContent'</h3>
                <div>
                  <div className="model-select-grid">
                    <span className="model-select-label">Model used now:</span>
                    <div>
                    <span className="model-select-value">{modelUsed}</span>
                    </div>
                    <span className="model-select-label">Model selected:</span>
                    <div>
                    <span className="model-select-value">{selectedModelName?.name}</span>
                    </div>
                  </div>
                    <button className="set-selected-model-btn"
                      disabled={selectedModelName?.name && selectedModelName.name !== modelUsed ? false : true}
                      onClick={()=>selectedModelName?.name && setModelUsed(selectedModelName?.name)}>
                        Set selected model as model to use
                    </button>
                  {/* </p> */}
                </div>
              <p style={{margin: "0 auto 10px auto"}}>Available models supporting 'generateContent':</p>      
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
          placeholder="Type your message here... Note: Send will delete old message."
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
        {/* <p>Note: To keep trial simple, only one message exchange is shown/retained.</p> */}
        {youSaid && <p className="message message-user">{youSaid}</p>}
        {isLoading && <p className="loading-text">Generating response...</p>}
      </div>
      <div className="trial-chat-response">
        { !isLoading && response ?
        <div className="message message-bot">
          <ReactMarkdown>{response}</ReactMarkdown>
          {/* Below code is a hack for issue that adding padding bottom to message-bot class does not seem to work */}
          <div style={{paddingBottom:"5px"}}></div>
        </div>
        : null
        }
      </div>
    </div>
  )
}

export default Trial