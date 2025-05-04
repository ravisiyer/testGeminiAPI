import React from 'react';
import { Dialog } from 'primereact/dialog';

const ModelInfo = ({model, dialogVisible, setDialogVisible}) => {
  return (
    // console.log("ModelInfo component rendered with model: ", model),
    // console.log("ModelInfo component rendered with dialogVisible: ", dialogVisible),
    <Dialog
      header={`Name: ${model?.name}`}
      visible={dialogVisible}
      onHide={() => setDialogVisible(false)}
      modal
  >
      <p className="model-info-p">Display Name: {model?.displayName}</p>
      <p className="model-info-p">Description: {model?.description}</p>
  </Dialog>
  );
};

export default ModelInfo;