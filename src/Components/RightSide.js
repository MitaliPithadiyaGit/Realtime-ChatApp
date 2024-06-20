import React, { useEffect, useState, useRef } from 'react';
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Fab,
  makeStyles,
  Avatar,
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: '100%',
    height: '80vh',
  },
  headBG: {
    backgroundColor: '#e0e0e0',
  },
  borderRight500: {
    borderRight: '1px solid #e0e0e0',
  },
  messageArea: {
    height: '70vh',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
  },
  avatar: {
    marginRight: '10px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#999',
    fontFamily:"math",
    display:"flex",
    justifyContent:"flex-end",
    marginTop:"17px",
    marginLeft:"10px"
  },
  messageBubbleSent: {
    backgroundColor: '#dbdbdb',
    borderRadius: '15px 0px 15px 15px',
    padding: '10px',
    maxWidth: 'max-content',
    wordBreak: 'break-word',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '5px',
    position: 'relative',
  },
  messageBubbleReceived: {
    backgroundColor: '#dbdbdb',
    borderRadius: '15px 15px 15px 0px',
    padding: '10px',
    maxWidth: 'max-content',
    wordBreak: 'break-word',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '5px',
    position: 'relative',
  },
  messageContainer: {
    display: 'flex',
    marginBottom: '10px',
  },
  sentContainer: {
    justifyContent: 'flex-end',
  },
  receivedContainer: {
    justifyContent: 'flex-start',
    marginLeft:"8px"
  },
  Username:{
    fontFamily:"system-ui",
    textTransform:"capitalize",
    letterSpacing:'0.1rem'
  }
});

const RightSide = ({ selectedUser, setSelectedUser }) => {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const ws = useRef(null);
  const token = localStorage.getItem('token');
  const { id: userId } = useParams();
  const receiverId = selectedUser ? selectedUser._id : null;

  useEffect(() => {
    const savedUser = localStorage.getItem('selectedUser');
    if (savedUser) {
      setSelectedUser(JSON.parse(savedUser));
    }
  }, [setSelectedUser]);

  useEffect(() => {
    if (receiverId && userId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/getmessages`, {
            params: { sender: userId, receiver: receiverId },
            headers: {
              Authorization: `Bearer ${token}`,
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
    }
  }, [receiverId, token, userId]);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(`ws://localhost:5000?userId=${userId}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        try {
          console.log('Message received from WebSocket:', event.data);
          const { sender, message,  } = JSON.parse(event.data);
          
          // Update timestamp to current server time
          const receivedTimestamp = new Date().toISOString();
  
          setMessages((prevMessages) => [...prevMessages, { sender, message, timestamp: receivedTimestamp }]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect WebSocket here if needed
        connectWebSocket(); // Example: immediate attempt to reconnect
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Handle WebSocket errors here
      };
    };

    if (userId) {
      connectWebSocket();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId]); // Only depend on userId for WebSocket connection

  const sendMessage = async () => {
    if (message.trim() && ws.current.readyState === WebSocket.OPEN) {
      try {
        const msg = { sender: userId, receiver: receiverId, message };
        const timestamp = new Date().toISOString();

        // Optimistically update the UI before sending the message to the server
        setMessages((prevMessages) => [...prevMessages, { sender: userId, message, timestamp }]);
        setMessage('');

        const response = await axios.post('http://localhost:5000/messages', { ...msg, timestamp }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data) {
          throw new Error('Failed to send message');
        }

        console.log('Message sent via WebSocket:', msg);
        ws.current.send(JSON.stringify(msg));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  

  return (
    <Grid item xs={9}>
      {selectedUser ? (
        <div>
          <div className={classes.header}>
            <Avatar
              alt={selectedUser.username}
              src={`http://localhost:5000/${selectedUser?.image}`}
              className={classes.avatar}
            />
            <h3 className={classes.Username}>{selectedUser.username}</h3>
          </div>

          <List className={classes.messageArea}>
            {messages.length === 0 ? (
              <ListItem>
                <ListItemText
                  align="center"
                  primary={`Start chatting with ${selectedUser.username}`}
                />
              </ListItem>
            ) : (
              messages.map((msg, index) => (
                <div
                  className={`${classes.messageContainer} ${msg.sender === userId ? classes.sentContainer : classes.receivedContainer}`}
                  key={index}
                >
                  <ListItem 
                    className={msg.sender === userId ? classes.messageBubbleSent : classes.messageBubbleReceived}
                  >
                    <ListItemText 
                      primary={
                        <>
                          {msg.message}
                        </>
                      }
                    />
                    {/* Timestamp styling */}
                    <span className={classes.timestamp}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </ListItem>
                </div>
              ))
            )}
          </List>

          <Grid container style={{ padding: '20px' }}>
            <Grid item xs={11}>
              <TextField
                id="outlined-basic-email"
                label="Type Something"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
              />
            </Grid>
            <Grid item xs={1} align="right">
              <Fab color="primary" aria-label="send" onClick={sendMessage}>
                <SendIcon />
              </Fab>
            </Grid>
          </Grid>
        </div>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: '20%' }}>
          <h2>Select a user to start chatting</h2>
        </div>
      )}
    </Grid>
  );
};

export default RightSide;
