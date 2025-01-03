import React, { useState } from 'react';
import './MessageInput.css';

function MessageInput({ onSendMessage }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue(''); // Clear input after sending
    }
  };

  return (
    <div className='message-input'>
      <textarea
        className='text-area'
        placeholder='Type your message'
        value={inputValue}
        onChange={handleInputChange}
      />
      <button className='send-button' onClick={handleSendMessage}>Send</button>
    </div>
  );
}

export default MessageInput;
