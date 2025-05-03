import './Modal.css'; // Import CSS for styling

const Modal = ({ isOpen, onClose, maxModalContentWidth="800px", children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" 
        style={maxModalContentWidth ? {maxWidth: `${maxModalContentWidth}`} : null }>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;