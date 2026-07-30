import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signUp = () => {
    if (submitting) return;
    setSubmitting(true);
    const request = api.createNewUser(username, password, email);
    toast.promise(request, {
      loading: 'Creating your account…',
      success: 'Account created — please log in',
      error: (err) => (err.status === 400 ? 'That account already exists' : 'Unable to create account')
    });
    request
      // Signup does not log the user in, so send them to the login page.
      .then(() => navigate('/login'))
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  const onEnter = (e) => {
    if (e.key === 'Enter') signUp();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <PageHeader to="/" />

      <main className="flex flex-1 items-center justify-center px-5 py-8">
        <form
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-9 shadow-md"
          onSubmit={(e) => e.preventDefault()}
        >
          <h1 className="text-center text-2xl">Create your account</h1>
          <p className="mb-7 mt-1 text-center text-slate-500">Start protecting your passwords</p>

          <div className="mb-4">
            <label className="field-label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyUp={onEnter}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="field-label" htmlFor="signup-username">
              Username
            </label>
            <input
              id="signup-username"
              className="input"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={onEnter}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="field-label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              className="input"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onEnter}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="button"
            className="btn btn-primary mt-2 w-full"
            id="signUpButton"
            onClick={signUp}
            disabled={submitting}
          >
            Sign up
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
