import React, { useState} from "react";
import Modal from './Modal';
import { ListBox } from 'primereact/listbox';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import './GeminiModelsList.css'

const GeminiModelsList = ({isModalOpen, closeModal, modelUsed, setModelUsed,
  modelsList}) => {
  const [selectedModelName, setSelectedModelName] = useState(null);

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={closeModal} maxModalContentWidth="400px">
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
                <button className="btn set-selected-model-btn"
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
                <ListBox value={selectedModelName} filter
                  onChange={(e) => setSelectedModelName(e.value)}
                  options={modelsList} optionLabel="name" className="w-full md:w-14rem" />
              </div>
          </div>
          <div className="models-list-close">
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GeminiModelsList