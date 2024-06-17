import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Grid } from '@material-ui/core';
import LeftSide from './LeftSide';
import RightSide from './RightSide';
import { AuthContext } from '../Context/AuthContext';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: '100%',
    height: '80vh'
  },
  headBG: {
      backgroundColor: '#e0e0e0'
  },
  borderRight500: {
      borderRight: '1px solid #e0e0e0'
  },
  messageArea: {
    height: '70vh',
    overflowY: 'auto'
  }
});

const ChatDashboard = () => {
  const classes = useStyles();
  const [selectedUser, setSelectedUser] = useState(null); 
  const { id: userId } = useParams(); 
  const [user, setUser] = useState("");

  const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token || !userId) {
        console.error('No token or user ID found in local storage');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const user = await response.json();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

  useEffect(() => {
      fetchData();
  }, [userId]);

  useEffect(() => {
    const savedUser = localStorage.getItem('selectedUser');
    if (savedUser) {
      setSelectedUser(JSON.parse(savedUser));
    }
  }, []);

  

  return (
    <div>
      <Grid container>
          <Grid item xs={12} >
              <Typography variant="h5" className="header-message">Chat</Typography>
          </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <LeftSide user={user} setSelectedUser={setSelectedUser} />
        <RightSide selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      </Grid>
    </div>
  );
}

export default ChatDashboard;
 