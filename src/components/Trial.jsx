import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown'; // to render markdown responses
import './trial.css'
import TextareaAutosize from 'react-textarea-autosize';
import {isMobile} from 'react-device-detect';
import { GoogleGenAI } from "@google/genai";
import GeminiModelsList from "./GeminiModelsList";
import debounce from 'lodash/debounce';
import ModelInfo from "./ModelInfo";
import ModelNameInfoButton from "./ModelNameInfoButton";
import { Checkbox } from 'primereact/checkbox';
        

const key = process.env.REACT_APP_GEMINI_API_KEY
const genAI = new GoogleGenAI({ apiKey: key });

function Trial() {
  const [userInput, setUserInput] = useState('');
  const [youSaid, setYouSaid] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState(process.env.REACT_APP_GEMINI_MODEL_NAME || "models/gemini-2.0-flash");
  // Below state variable has immediately updated value of modelUsed input field and is tied to OnChange event
  // Above modelUsed state variable gets updated after a debouncing delay to limit its useEffect related code 
  // executions.
  // This approach is needed as directly debouncing setModelUsed invocation in OnChange event results in 
  // cursor position issue in React.
  const [localModelUsed, setLocalModelUsed] = useState(modelUsed);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelsList, setModelsList] = useState([])
  const defaultChatContainerWidth = process.env.REACT_APP_DEFAULT_CHAT_CONTAINER_WIDTH ?
     process.env.REACT_APP_DEFAULT_CHAT_CONTAINER_WIDTH : "800px"
  const [chatContainerWidth, setChatContainerWidth] = useState(defaultChatContainerWidth);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [modelUsedInputWidth, setModelUsedInputWidth] = useState('auto');
  const modelUsedInputRef = useRef(null);
  const measureRef = useRef(null);

  const [infoModel, setInfoModel] = useState(null);
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [groundingWithGS, setGroundingWithGS] = useState(false);
  const [hasUserChangedGSS, setHasUserChangedGSS] = useState(false);

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 200); // 200ms debounce delay

    window.addEventListener('resize', handleResize);

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
        console.error("Fetching list of available models failed:", error);
        return;  
      }
      console.log("Available models:", data);
      if (data?.models?.length) {
        data.models = data.models.filter(model =>
          model.supportedGenerationMethods.includes('generateContent')
        );
      }
      setModelsList(data?.models || []);
    }
   
    listAvailableModels();
  },[])

  useEffect(() => {
    if (!measureRef.current) return;
    measureRef.current.textContent = modelUsed;
    setModelUsedInputWidth(measureRef.current.offsetWidth + 8); // Add some extra space
  }, [modelUsed]);

  useEffect(() => {
    if (hasUserChangedGSS) {
      // setHasUserChangedGSS(false);
    } else {
       setGroundingWithGS(isModel2p0OrLater(modelUsed));
      // isModel2p0OrLater(modelUsed) ? (!groundingWithGS && setGroundingWithGS(true)) : 
      //   (groundingWithGS && setGroundingWithGS(false));
    }
  }, [modelUsed, groundingWithGS, hasUserChangedGSS]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    modelUsed !== localModelUsed && setLocalModelUsed(modelUsed); 
    setIsModalOpen(false);
  };

  const isModel2p0OrLater = (model) => {
    return model.startsWith("models/gemini-2."); // Not a perfect check but good enough for now.
  }

  const generateContent = async (prompt) => {

    const generateContentParams = {
      model: modelUsed,
      contents: prompt,
    }
    
    if (groundingWithGS) {
      generateContentParams.config = { tools: [{googleSearch: {}}], }
    }

    const response = await genAI.models.generateContent(generateContentParams);
    console.log(response?.text);
    if (generateContentParams.config) {
      // To get grounding metadata as web content.
      console.log("Grounding metadata:");  
      console.log(response?.candidates[0]?.groundingMetadata.searchEntryPoint.renderedContent);
    }

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

  const handleToggleFullScreen = () => {
    if (chatContainerWidth === "100vw" ) {
      setChatContainerWidth(defaultChatContainerWidth)
    } else {
      setChatContainerWidth("100vw")
    }
  }
  
  const isWindowWiderThanDefaultCCWidth = () => {
    const intDefaultChatContainerWidth = parseInt(defaultChatContainerWidth);
    if (intDefaultChatContainerWidth) {
      return (windowWidth > intDefaultChatContainerWidth)
    }
    // console.log(`parseInt gave 0 or NaN for defaultChatContainerWidth: ${defaultChatContainerWidth}`)
    return false; // safe value
  }

  const debouncedSetModelUsed = debounce((value) => {
    setModelUsed(value);
  }, 300);

  return (
    <div className="trial-chat-container" style={{maxWidth: `${chatContainerWidth}`}}>
      <div className="trial-header-container">
        <div className="trial-header-row">
          <h2>Gemini AI API 2nd Trial</h2>
          <div> {isWindowWiderThanDefaultCCWidth() ? 
                  <button className="btn toggle-full-width-btn"
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
              // value={modelUsed}
              value={localModelUsed}
              // onChange={(e) => setModelUsed(e.target.value)}
              onChange={(e) => {
                const value = e.target.value;
                setLocalModelUsed(value); // Update local state immediately
                debouncedSetModelUsed(value); // Update debounced state
              }}
              style={{ width: modelUsedInputWidth, minWidth: '10px' }}
              ref={modelUsedInputRef}
            />
            <ModelNameInfoButton name={modelUsed} modelsList={modelsList}
            setInfoModel={setInfoModel} setDialogVisible={setInfoDialogVisible} />
            {infoDialogVisible &&
              (<ModelInfo 
                model={infoModel}
                dialogVisible={infoDialogVisible}
                setDialogVisible={setInfoDialogVisible}
              />
              )}
          </div>
          <div>
            <button className="btn list-models-btn" onClick={openModal}
            disabled={!(modelsList?.length)}>
              {/* No error handling for failure to load list. So simple UI of simply keeping List disabled 
                if modelsList is empty.*/}
              List  
            </button>
          </div>
        </div>
        <GeminiModelsList isModalOpen={isModalOpen}
          closeModal={closeModal}
          modelUsed={modelUsed}
          setModelUsed={setModelUsed}
          modelsList={modelsList}
        />
        <div className="GGS-container">
            <Checkbox inputId="GGS" onChange={e => {setGroundingWithGS(e.checked); setHasUserChangedGSS(true)}}
             checked={groundingWithGS}></Checkbox>
            <label htmlFor="GGS" className="">Grounding with Google Search</label>
        </div>
        <div className="trial-input-container">
          <TextareaAutosize
          className="trial-input"
          type="text"
          value={userInput}
          onChange={handleUserInput}
          onKeyDown={isMobile ? undefined : handleKeyPress}
          placeholder={response ? "Type new message here (old message will be replaced)..."
          : "Type your message here..."}
          disabled = {isLoading ? true : false}
          maxRows={10}
          />
          <div>
            <button className="btn" onClick={handleSubmit} disabled={isLoading}>
              Send
            </button>
          </div>
        </div>
        {youSaid && <p className="message message-user">{youSaid}</p>}
        {isLoading && <p className="loading-text">Waiting for response from Gemini...</p>}
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