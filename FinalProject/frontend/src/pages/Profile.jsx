import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import useRequireAuth from '../hooks/useRequireAuth.js';
import '../styles/profile.css';

const logo = '/images/managerlogomedium.png';

export default function Profile() {
  const navigate = useNavigate();
  const user = useRequireAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
    }
  }, [user]);

  const signOut = (e) => {
    e.preventDefault();
    api.logOut().then(() => navigate('/login'));
  };

  return (
    <div className="profile-container">
      <main className="main-content">
        <div className="main-header">
          <h1>Profile</h1>
          <Link to="/home" className="btn btn-secondary main-menu-btn" role="button" id="logo-container">
            <img src={logo} alt="" id="logo-img" />
          </Link>
        </div>

        <div className="profile-info">
          <div className="card-block">
            <p>User Email:</p>
            <input
              type="email"
              placeholder="Enter email here"
              className="profile-input"
              id="email-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <p>Username:</p>
            <input
              type="text"
              placeholder="Enter username here"
              className="profile-input"
              id="user-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <a href="/login" className="btn btn-primary sign-out-btn" id="sign-out" role="button" onClick={signOut}>
            Sign Out
          </a>
        </div>
      </main>
    </div>
  );
}
