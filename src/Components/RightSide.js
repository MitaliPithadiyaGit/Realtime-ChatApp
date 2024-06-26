import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Fab,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import "./RightSide.css";
import SendIcon from "@mui/icons-material/Send";

const RightSide = ({ selectedUser, setSelectedUser, setSelectedUsers }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const ws = useRef(null);
  const token = localStorage.getItem("token");
  const { id: userId } = useParams();
  const receiverId = selectedUser ? selectedUser._id : null;

  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser");
    if (savedUser) {
      setSelectedUser(JSON.parse(savedUser));
    }
  }, [setSelectedUser]);

  useEffect(() => {
    if (receiverId && userId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/getmessages`,
            {
              params: { sender: userId, receiver: receiverId },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.data) {
            throw new Error("Failed to fetch messages");
          }
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [receiverId, token, userId]);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(`ws://localhost:5000?userId=${userId}`);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.current.onmessage = (event) => {
        try {
          console.log("Message received from WebSocket:", event.data);
          const { sender, message, timestamp } = JSON.parse(event.data);
          const receivedTimestamp = new Date().toISOString();

          setMessages((prevMessages) => [
            ...prevMessages,
            { sender, message, timestamp: receivedTimestamp },
          ]);
          setSelectedUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === sender
                ? { ...user, lastMessage: { sender, message, timestamp } }
                : user
            )
          );
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        // Attempt to reconnect WebSocket here if needed
        connectWebSocket(); // Example: immediate attempt to reconnect
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
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
  }, [userId, setSelectedUsers, receiverId]);

  const sendMessage = async () => {
    if (message.trim() && ws.current.readyState === WebSocket.OPEN) {
      try {
        const msg = { sender: userId, receiver: receiverId, message };
        const timestamp = new Date().toISOString();
        // Optimistically update the UI before sending the message to the server
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: userId, message, timestamp },
        ]);
        setMessage("");

        const response = await axios.post(
          "http://localhost:5000/messages",
          { ...msg, timestamp },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data) {
          throw new Error("Failed to send message");
        }
        setSelectedUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === receiverId
              ? { ...user, lastMessage: { sender: userId, message, timestamp } }
              : user
          )
        );

        console.log("Message sent via WebSocket:", msg);
        ws.current.send(JSON.stringify(msg));
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      // Manually format the date as dd MMM yyyy
      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
  };

  return (
    <Grid item xs={9}>
      {selectedUser ? (
        <div>
          <div className="header">
            <Avatar
              alt={selectedUser.username}
              src={`http://localhost:5000/${selectedUser?.image}`}
              className="avatar"
            />
            <h3 className="Username">{selectedUser.username}</h3>
          </div>

          <List className="messageArea">
            {messages.length === 0 ? (
              <ListItem>
                <ListItemText
                  align="center"
                  primary={`Start chatting with ${selectedUser.username}`}
                />
              </ListItem>
            ) : (
              messages.map((msg, index) => (
                <>
                  <div className="DateMainDiv">
                    {(index === 0 ||
                      formatDate(messages[index - 1].timestamp) !==
                        formatDate(msg.timestamp)) && (
                      <div className="Date">{formatDate(msg.timestamp)}</div>
                    )}
                  </div>
                  <div
                    className={`messageContainer ${
                      msg.sender === userId
                        ? "sentContainer"
                        : "receivedContainer"
                    }`}
                    key={index}
                  >
                    <ListItem
                      className={
                        msg.sender === userId
                          ? "messageBubbleSent"
                          : "messageBubbleReceived"
                      }
                    >
                      <ListItemText primary={<>{msg.message}</>} />
                      {/* Timestamp styling */}
                      <span className="timestamp">
                        {formatTime(msg.timestamp)}
                      </span>
                    </ListItem>
                  </div>
                </>
              ))
            )}
          </List>

          <Grid container style={{ padding: "20px" }}>
            <Grid item xs={11}>
              <TextField
                id="outlined-basic-email"
                label="Type Something"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
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
        <div style={{ textAlign: "center", paddingTop: "20%" }}>
          <h2>Select a user to start chatting</h2>
        </div>
      )}
    </Grid>
  );
};

export default RightSide;
