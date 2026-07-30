import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const login = () => {
    if (submitting) return;
    setSubmitting(true);
    const request = api.logIn(username, password);
    toast.promise(request, {
      loading: 'Signing in…',
      success: 'Signed in',
      error: (err) => (err.status === 401 ? 'Invalid username or password' : 'Unable to sign in')
    });
    request
      .then(() => navigate('/home'))
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  const onEnter = (e) => {
    if (e.key === 'Enter') login();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <PageHeader to="/" />

      <main className="flex flex-1 items-center justify-center px-5 py-8">
        <form
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-9 shadow-md"
          onSubmit={(e) => e.preventDefault()}
        >
          <h1 className="text-center text-2xl">Welcome back</h1>
          <p className="mb-7 mt-1 text-center text-slate-500">Sign in to your account</p>

          <div className="mb-4">
            <label className="field-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              className="input"
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={onEnter}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onEnter}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="button"
            className="btn btn-primary mt-2 w-full"
            id="loginButton"
            onClick={login}
            disabled={submitting}
          >
            Log in
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
