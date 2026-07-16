import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import '../styles/login.css';

const logo = '/images/managerlogomedium.png';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = () => {
    setError('');
    api
      .logIn(username, password)
      .then(() => navigate('/home'))
      .catch((err) => {
        setError(err.status === 401 ? 'Invalid username or password' : String(err));
      });
  };

  const onEnter = (e) => {
    if (e.key === 'Enter') login();
  };

  return (
    <div className="login-page">
      <header>
        <div className="main-header">
          <a className="btn btn-primary" role="button" id="logo-container">
            <img src={logo} alt="" id="logo-img" />
          </a>
        </div>
      </header>

      <main>
        {error && <div id="errorbox">{error}</div>}
        <form onSubmit={(e) => e.preventDefault()}>
          <h1>Please Sign In</h1>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={onEnter}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onEnter}
              required
            />
          </div>
          <p>
            <input className="btn btn-primary" id="loginButton" type="button" value="Log In" onClick={login} />
          </p>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </main>
    </div>
  );
}
