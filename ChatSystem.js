import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Chat = ({ room }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = io.connect('http://localhost:5000');

  useEffect(() => {
    socket.emit('joinRoom', room);

    socket.on('message', (data) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    return () => {
      socket.off('message');
    };
  }, [room]);

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit('message', { room, content: message });
    setMessage('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.content}</div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
