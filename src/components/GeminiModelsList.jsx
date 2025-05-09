import React, { useState} from "react";
import ModelInfo from "./ModelInfo";
import { ListBox } from 'primereact/listbox';
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './GeminiModelsList.css'
import ModelNameInfoButton from "./ModelNameInfoButton";
import { Dialog } from 'primereact/dialog';

const GeminiModelsList = ({isModalOpen, closeModal, modelUsed, setModelUsed,
  modelsList}) => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [infoModel, setInfoModel] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const itemTemplate = (option) => (
    <div className="listbox-item-template">
        <span className="span-listbox-item">{option.name}</span>
        <Button
            type="button"
            icon="pi pi-info-circle"
            className="p-button-text p-button-sm"
            onMouseDown={(e) => {
              e.stopPropagation(); 
              // console.log("Mouse down on info icon for option: ", option);
              setInfoModel(option);
              setDialogVisible(true);
            }}
        />
    </div>
);
  const handleItemClick = (e) => {
    setSelectedModel(e.value);
    // setDialogVisible(true);
  };  

  return (
    <div>
      <Dialog header="Models with 'generateContent'"
        visible={isModalOpen} style={{ maxWidth: '600px' }} onHide={closeModal}>
        <div className="models-list-content">
          <div className="models-list-header">
            <div>
              <div className="model-select-grid">
                <span className="model-select-label">Model used now:</span>
                <div>
                  <span className="model-select-value">{modelUsed}</span>
                  <ModelNameInfoButton name={modelUsed} modelsList={modelsList}
                  setInfoModel={setInfoModel} setDialogVisible={setDialogVisible} />
                </div>
                <span className="model-select-label">Model selected:</span>
                <div>
                  <span className="model-select-value">{selectedModel?.name}</span>
                  <ModelNameInfoButton name={selectedModel?.name} modelsList={modelsList}
                  setInfoModel={setInfoModel} setDialogVisible={setDialogVisible} />
                </div>
              </div>
                <button className="btn set-selected-model-btn"
                  disabled={!selectedModel?.name || selectedModel.name === modelUsed}
                  onClick={()=>selectedModel?.name && setModelUsed(selectedModel?.name)}>
                    Use selected model
                </button>
                <button className="btn models-list-close" onClick={closeModal}>Close</button>
            </div>
          <p className="available-models-label">Available models supporting 'generateContent':</p>      
          </div>
          <div className="models-list">
                <ListBox value={selectedModel} filter
                  onChange={handleItemClick}
                  options={modelsList}
                  optionLabel="name"
                  itemTemplate={itemTemplate}
                />
                {dialogVisible &&
                  (<ModelInfo 
                    model={infoModel}
                    dialogVisible={dialogVisible}
                    setDialogVisible={setDialogVisible}
                  />
                  )}
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default GeminiModelsList