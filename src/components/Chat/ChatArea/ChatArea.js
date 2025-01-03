import React, { useState, useEffect } from 'react';
import MessageGroup from '../MessageGroup/MessageGroup';
import Sidebar from '../SideBar/Sidebar';
import MessageInput from '../MessageInput/MessageInput';
import './ChatArea.css';

function ChatArea({ userType }) {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (!activeChat) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No token found');
      return;
    }
     
    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${activeChat.id}/?token=${token}&role=${activeChat.userType}`
    );

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'chat_history') {
        // Add chat history to the messages state
        const history = data.messages.map((msg) => ({
          text: msg.message,
          sender: msg.sender || 'unknown',
          timestamp: msg.timestamp,
        }));
        setMessages(history);
      } else if (data.type === 'chat_message') {
        // Add a new message to the messages state
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: data.message,
            sender: data.sender,
            timestamp: data.timestamp,
          },
        ]);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      socket.close();
    };
  }, [activeChat]);

  const handleSendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = { message, sender: userType };
      ws.send(JSON.stringify(payload));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  // Group messages by sender
  const groupedMessages = [];
  messages.forEach((msg, index) => {
    const previousMessage = messages[index - 1];
    if (!previousMessage || previousMessage.sender !== msg.sender) {
      groupedMessages.push({
        sender: msg.sender,
        messages: [
          { text: msg.text, timestamp: msg.timestamp }, // Include timestamp
        ],
      });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push({
        text: msg.text,
        timestamp: msg.timestamp, // Include timestamp
      });
    }
  });

  return (
    <div className="chat-container">
      <Sidebar
        userType={userType}
        onSelectChat={setActiveChat}
      />
      <div className="chat-area">
        {activeChat ? (
          <>
            <div className="chat-header">
              <h3>Chat with {activeChat.full_name}</h3>
            </div>
            <div className="messages">
              {groupedMessages.map((group, index) => (
                <MessageGroup
                  key={index}
                  messages={group.messages}
                  isSender={group.sender === userType}
                />
              ))}
            </div>
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a {userType === 'doctor' ? 'patient' : 'doctor'} to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatArea;
