import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import '../styles/signup.css';

const logo = '/images/managerlogomedium.png';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const signUp = () => {
    setError('');
    api
      .createNewUser(username, password, email)
      // Signup does not log the user in, so send them to the login page.
      .then(() => navigate('/login'))
      .catch((err) => {
        setError(err.status === 400 ? 'User Account Already Exists' : String(err));
      });
  };

  const onEnter = (e) => {
    if (e.key === 'Enter') signUp();
  };

  return (
    <div className="signup-page">
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
          <h1>Create New Account</h1>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyUp={onEnter}
              required
            />
          </div>
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
            <input className="btn btn-primary" id="signUpButton" type="button" value="Sign Up" onClick={signUp} />
          </p>
        </form>
        <p>
          I have an account. <Link to="/login">Log In</Link>
        </p>
      </main>
    </div>
  );
}
