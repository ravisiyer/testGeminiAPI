import React from 'react'
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import './ModelNameInfoButton.css'
  
const ModelNameInfoButton = ({name, modelsList, setInfoModel, setDialogVisible}) => {

  const getModelByName = (name) => {
      const model = modelsList.find((model) => model.name === name);
      return model;
    }
  
    const handleModelNameInfoClick = (e, name) => {
      e.stopPropagation(); 
      // console.log("Mouse down on info icon for option: ", option);
      const model = getModelByName(name);
      if (model === undefined) {
        console.log("Model not found: ", name);
        return;
      } else {
        setInfoModel(model);
        setDialogVisible(true);
      }
    }
    
  return (
    name && getModelByName(name) ?
      <Button
      type="button"
      icon="pi pi-info-circle"
      className="p-button-text p-button-sm"
      onMouseDown={(e) => {
          handleModelNameInfoClick(e, name);
      }}
      />
    : null 
  )
}

export default ModelNameInfoButton