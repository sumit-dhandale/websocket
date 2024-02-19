import React, { useState, useEffect } from 'react';
import ActionCable from 'actioncable';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const cable = ActionCable.createConsumer('ws://localhost:3000/cable');

    const newSubscription = cable.subscriptions.create(
      { channel: 'ChatChannel' },
      {
        connected: () => console.log('Connected to ActionCable'),
        disconnected: () => console.log('Disconnected from ActionCable'),
        received: (data) => {
          console.log('Received data:', data)
          if (data.type === 'message') {
            setMessages((prevMessages) => [...prevMessages, data.message]);
          } else if (data.type === 'reply') {
            setMessages((prevMessages) => [...prevMessages, data.reply]);
          }
        },
      }
    );

    console.log('Subscription:', newSubscription);

    setSubscription(newSubscription);

    return () => {
      console.log('Unsubscribing...');
      newSubscription.unsubscribe();
    };
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() !== '' && subscription) {
      subscription.send({ message: input });
      setInput('');
    }
  };

  return (
    <div className="app-container">
      <h1>Chat App</h1>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className="message">{message}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default App;
