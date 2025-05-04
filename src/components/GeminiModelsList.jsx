import React, { useState} from "react";
import Modal from './Modal';
import ModelInfo from "./ModelInfo";
// import { Dialog } from 'primereact/dialog';
import { ListBox } from 'primereact/listbox';
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './GeminiModelsList.css'
import ModelNameInfoButton from "./ModelNameInfoButton";

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
              // setSelectedModel(option);
              setDialogVisible(true);
            }}
        />
    </div>
);
  const handleItemClick = (e) => {
    setSelectedModel(e.value);
    // setDialogVisible(true);
  };  

  // const getModelByName = (name) => {
  //   const model = modelsList.find((model) => model.name === name);
  //   return model;
  // }

  // const handleModelNameInfoClick = (e, name) => {
  //   e.stopPropagation(); 
  //   // console.log("Mouse down on info icon for option: ", option);
  //   const model = getModelByName(name);
  //   if (model === undefined) {
  //     console.log("Model not found: ", name);
  //     return;
  //   } else {
  //     setInfoModel(model);
  //     setDialogVisible(true);
  //   }
  // }
  
  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={closeModal} maxModalContentWidth="500px">
        <div className="models-list-content">
          <div className="models-list-header">
            <h3>Models with 'generateContent'</h3>
            <div>
              <div className="model-select-grid">
                <span className="model-select-label">Model used now:</span>
                <div>
                  <span className="model-select-value">{modelUsed}</span>
                  <ModelNameInfoButton name={modelUsed} modelsList={modelsList}
                  setInfoModel={setInfoModel} setDialogVisible={setDialogVisible} />
                  {/* {modelUsed && getModelByName(modelUsed) &&
                    <Button
                    type="button"
                    icon="pi pi-info-circle"
                    className="p-button-text p-button-sm"
                    onMouseDown={(e) => {
                      handleModelNameInfoClick(e, modelUsed);
                    }}
                    />
                  } */}
                </div>
                <span className="model-select-label">Model selected:</span>
                <div>
                  <span className="model-select-value">{selectedModel?.name}</span>
                  <ModelNameInfoButton name={selectedModel?.name} modelsList={modelsList}
                  setInfoModel={setInfoModel} setDialogVisible={setDialogVisible} />
                  {/* {selectedModel?.name && 
                    <Button
                      type="button"
                      icon="pi pi-info-circle"
                      className="p-button-text p-button-sm"
                      onMouseDown={(e) => {
                        handleModelNameInfoClick(e, selectedModel.name);
                      }}
                    />
                  } */}
                </div>
              </div>
                <button className="btn set-selected-model-btn"
                  disabled={!selectedModel?.name || selectedModel.name === modelUsed}
                  onClick={()=>selectedModel?.name && setModelUsed(selectedModel?.name)}>
                    Set selected model as model to use
                </button>
            </div>
          <p className="available-models-label">Available models supporting 'generateContent':</p>      
          </div>
          <div className="models-list">
                <ListBox value={selectedModel} filter
                  onChange={handleItemClick}
                  // onChange={(e) => setSelectedModel(e.value)}
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
              {/* <Dialog
                header={`Name: ${selectedModel?.name}`}
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                modal
            >
                <p className="p-listbox-item">Display Name: {selectedModel?.displayName}</p>
                <p className="p-listbox-item">Description: {selectedModel?.description}</p>
            </Dialog> */}
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