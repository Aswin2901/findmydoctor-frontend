import React from 'react';
import './MessageGroup.css';

function MessageGroup({ messages, isSender }) {
  console.log('is_sender', isSender);

  return (
    <div className={`message-group ${isSender ? 'sent' : 'received'}`}>
      {messages.map((message, index) => (
        console.log(message, 'message !!!!!!!!!!!!!!'),
        <>
          <div className="message-bubble">
            {message.text}
          </div>
          <div className="message-timestamp">
            {isNaN(new Date(message.timestamp)) 
              ? "Now" 
              : new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
          </div>
        </>
      ))}
    </div>
  );
}

export default MessageGroup;
