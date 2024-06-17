import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Chat = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const receiverId = queryParams.get('receiverId');

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const ws = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const connectWebSocket = () => {
      ws.current = new WebSocket(`ws://localhost:5000?userId=${userId}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const { sender, message } = JSON.parse(event.data);
          setMessages(prevMessages => [...prevMessages, { sender, message }]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Handle error gracefully, e.g., attempt to reconnect
        // You can implement a retry mechanism here if needed
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId, token]); // Ensure WebSocket connection re-initializes when userId or token changes


  const sendMessage =async () => {
    if (message.trim() && ws.current.readyState === WebSocket.OPEN) {
        try {
            const msg = { sender: userId, receiver: receiverId, message };
    
            const response = await axios.post('http://localhost:5000/messages', msg, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
    
            if (!response.data) {
              throw new Error('Failed to send message');
            }
    

            ws.current.send(JSON.stringify(msg));
            setMessages(prevMessages => [...prevMessages, { sender: userId, message }]);
            setMessage('');
          } catch (error) {
            console.error('Error sending message:', error);
          }
        }
    
    }


//   const sendMessage = async () => {
//     if (message.trim()) {
//       try {
//         const msg = { sender: userId, receiver: receiverId, message };

//         const response = await axios.post('http://localhost:5000/messages', msg, {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//         });

//         if (!response.data) {
//           throw new Error('Failed to send message');
//         }

//         setMessages(prevMessages => [...prevMessages, { sender: userId, message }]);
//         setMessage('');
//       } catch (error) {
//         console.error('Error sending message:', error);
//       }
//     }
//   };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/getmessages`, {
          params: { sender: userId, receiver: receiverId },
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.data) {
          throw new Error('Failed to fetch messages');
        }

        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId, receiverId, token]);

  return (
    <div>
      <div>Chat with {receiverId}</div>
      <div>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === userId ? 'my-message' : 'other-message'}>
            <strong>{msg.sender === userId ? "me" : username}: </strong>{msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' ? sendMessage() : null}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
