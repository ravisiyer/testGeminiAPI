import React, { useState} from "react";
import Modal from './Modal';
import { Dialog } from 'primereact/dialog';
import { ListBox } from 'primereact/listbox';
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './GeminiModelsList.css'

const GeminiModelsList = ({isModalOpen, closeModal, modelUsed, setModelUsed,
  modelsList}) => {
  const [selectedModelName, setSelectedModelName] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // const itemTemplate = (option) => {
  //   return (
  //       <div title={option.name}>
  //           {option.code}
  //       </div>
  //   );
  // };
  const itemTemplate = (option) => (
    <div className="flex justify-between items-center w-full">
        <span className="span-listbox-item">{option.code}</span>
        {/* <Button
            // icon="pi pi-info-circle"
            className="p-button-text p-button-sm"
            onClick={(e) => {
                e.stopPropagation(); // prevent ListBox selection
                setSelectedModelName(option);
                setDialogVisible(true);
            }}
            // aria-label={`More info about ${option.name}`}
        /> */}
    </div>
);
  const handleItemClick = (e) => {
    setSelectedModelName(e.value);
    setDialogVisible(true);
  };  

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
                <span className="model-select-value">{selectedModelName?.code}</span>
                </div>
              </div>
                <button className="btn set-selected-model-btn"
                  disabled={selectedModelName?.name && selectedModelName.name === modelUsed}
                  onClick={()=>selectedModelName?.name && setModelUsed(selectedModelName?.name)}>
                    Set selected model as model to use
                </button>
            </div>
          <p style={{margin: "0 auto 10px auto"}}>Available models supporting 'generateContent':</p>      
          </div>
          <div className="models-list">
              <div className="card flex justify-content-center">  
                <ListBox value={selectedModelName} filter
                  onChange={handleItemClick}
                  // onChange={(e) => setSelectedModelName(e.value)}
                  options={modelsList}
                  optionLabel="code"
                  // optionLabel="name"
                  itemTemplate={itemTemplate}
                  // tooltip="This is a test tooltip"
                  // tooltipOptions={{ position: 'right' }}
                  className="w-full md:w-14rem" />
              </div>
              <Dialog
                header={selectedModelName?.code}
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                modal
                style={{ width: '80vw', maxWidth: '400px' }}
            >
                <p className="p-listbox-item">{selectedModelName?.name}</p>
            </Dialog>
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