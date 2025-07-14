import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { FaCrown, FaGift, FaTrophy } from 'react-icons/fa';


const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAvatarUrl = (name) => `https://api.dicebear.com/8.x/initials/svg?seed=${name}&backgroundColor=00897b,d81b60,8e24aa,3949ab&radius=50`;


function App() {

  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newUser, setNewUser] = useState('');
  const [lastClaimed, setLastClaimed] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [usersRes, leaderboardRes, historyRes] = await Promise.all([
          axios.get(`${API_URL}/users`),
          axios.get(`${API_URL}/leaderboard`),
          axios.get(`${API_URL}/history`)
        ]);

        setUsers(usersRes.data);
        setLeaderboard(leaderboardRes.data);
        setHistory(historyRes.data);

        // Set default selected user if users exist
        if (usersRes.data.length > 0 && !selectedUser) {
          setSelectedUser(usersRes.data[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        // You could set an error state here to show a message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []); 


  const fetchUsers = async () => {
    const res = await axios.get(`${API_URL}/users`);
    setUsers(res.data);
  };
  
  const fetchLeaderboard = async () => {
    const res = await axios.get(`${API_URL}/leaderboard`);
    setLeaderboard(res.data);
  };
  
  const fetchHistory = async () => {
    const res = await axios.get(`${API_URL}/history`);
    setHistory(res.data);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.trim()) return;
    try {
      await axios.post(`${API_URL}/users`, { name: newUser });
      setNewUser('');
      await fetchUsers(); // Refresh user list
    } catch (error) {
      alert('User already exists or failed to add!');
      console.error(error);
    }
  };

  const handleClaim = async () => {
    if (!selectedUser) return;
    try {
      const originalLeaderboard = [...leaderboard];
      const res = await axios.post(`${API_URL}/claim`, { userId: selectedUser });
      const updatedLeaderboard = res.data;
      setLeaderboard(updatedLeaderboard);


      const claimedUser = updatedLeaderboard.find(u => u._id === selectedUser);
      const originalUser = originalLeaderboard.find(u => u._id === selectedUser);
      const pointsDiff = claimedUser.points - (originalUser?.points || 0);
      setLastClaimed(`${claimedUser.name} claimed ${pointsDiff} points!`);
      setTimeout(() => setLastClaimed(null), 3000); 

      await fetchHistory(); 
    } catch (error) {
      console.error('Failed to claim points', error);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);


  const podiumOrder = [topThree.find(u => u.rank === 2), topThree.find(u => u.rank === 1), topThree.find(u => u.rank === 3)];

  if (isLoading) {
    return <div className="loading-screen">Loading Leaderboard...</div>;
  }

  return (
    <div className="app-container">
      <div className="leaderboard-container">
        <header className="leaderboard-header">
          <div className="header-tabs">
            <button className="tab active">Weekly</button>
            <button className="tab">Monthly</button>
          </div>
          <div className="header-timer">Settlement time 2 days 01:45:41</div>
        
        </header>

        <div className="podium">
          {podiumOrder.map((user, index) => {
            if (!user) return <div key={`placeholder-${index}`} className="podium-user"></div>; 
            const isFirst = user.rank === 1;
            return (
              <div key={user._id} className={`podium-user rank-${user.rank}`}>
                <div className="podium-avatar-container">
                  <img src={getAvatarUrl(user.name)} alt={user.name} className="podium-avatar" />
                  <div className="podium-rank">
                    {isFirst ? <FaCrown /> : user.rank}
                  </div>
                </div>
                <div className="podium-name">{user.name}</div>
                <div className="podium-score">
                  <FaTrophy className="score-icon" /> {user.points.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        <ul className="leaderboard-list">
          {restOfLeaderboard.map(user => (
            <li key={user._id} className="list-item">
              <div className="list-rank">{user.rank}</div>
              <div className="list-user">
                <img src={getAvatarUrl(user.name)} alt={user.name} className="list-avatar" />
                <span>{user.name}</span>
              </div>
              <div className="list-score">{user.points.toLocaleString()} <FaTrophy className="score-icon" /></div>
            </li>
          ))}
        </ul>
      </div>

      <div className="controls-history-container">
        <div className="controls-card">
          <h2>Controls</h2>
          
          {lastClaimed && <p className="claim-message">{lastClaimed}</p>}

          <form onSubmit={handleAddUser} className="control-form">
            <input
              type="text"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              placeholder="Enter new user name"
            />
            <button type="submit">Add User</button>
          </form>

          <div className="claim-section">
            <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
              {users.length === 0 && <option>Add a user first</option>}
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <button onClick={handleClaim} disabled={!selectedUser}>Claim Points</button>
          </div>
        </div>

        <div className="history-card">
          <h2>Claim History</h2>
          <ul className="history-list">
            {history.length === 0 && <li>No claims yet.</li>}
            {history.map(h => (
              <li key={h._id}>
                <div><strong>{h.userId?.name || 'Unknown'}</strong> claimed <strong>{h.pointsClaimed}</strong> points</div>
                <span className="history-time">{new Date(h.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;