import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId'); // Get current user's ID from localStorage
  
      if (!token || !userId) {
        console.error('No token or user ID found in local storage');
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:5000/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
  
        const users = await response.json();
        console.log(users);
        // Filter out the current user's data
        const filteredUsers = users.filter(user => user._id !== userId);
        setUserData(filteredUsers);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleOkClick = () => {
    if (selectedUser) {
      localStorage.setItem("username",selectedUser.username)
      navigate(`/chat?receiverId=${selectedUser._id}`);
    }
  };

  

  return (
    <div>
      <div>Dashboard======</div>
      <button onClick={openModal}>Open User List</button>
      <Modal isOpen={isModalOpen} onClos e={closeModal}>
        <h2>Select a User</h2>
        <ul>
          {userData.map((user) => (
            <li key={user._id} onClick={() => handleUserSelect(user)}>
              {user.username}
            </li>
          ))}
        </ul>
        <button onClick={handleOkClick} disabled={!selectedUser}>
          OK
        </button>
      </Modal>
    </div>
  );
};

export default Dashboard;
