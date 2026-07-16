import { useState } from 'react';
import api from '../api/client.js';

// A single account entry. Handles both a brand-new draft (account.id == null,
// saved via create) and an existing account (saved via update).
export default function AccountCard({ account, providerId, onChanged }) {
  const [username, setUsername] = useState(account.username || '');
  const [password, setPassword] = useState(account.password || '');
  const [notes, setNotes] = useState(account.notes || '');

  const save = () => {
    const done = () => onChanged();
    const fail = (err) => console.error('Error', err);

    if (account.id == null) {
      api.createAccount(providerId, username, password, notes).then(done).catch(fail);
    } else {
      api.updateAccount(providerId, account.id, username, password, notes).then(done).catch(fail);
    }
  };

  const remove = () => {
    if (account.id == null) {
      // Unsaved draft — just drop it from the list.
      onChanged();
      return;
    }
    api.deleteAccount(providerId, account.id).then(onChanged).catch((err) => console.error('Error', err));
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="card-block">
          <p>Username:</p>
          <input
            type="text"
            name="mainUsername"
            className="input-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p>Password:</p>
          <input
            type="text"
            name="mainPassword"
            className="input-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="card-block">
          <p>Notes:</p>
          <textarea
            name="mainNotes"
            className="input-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="card-block btn-block">
          <button type="button" className="save-btn" onClick={save}>
            Save Account
          </button>
          <button type="button" className="save-btn" onClick={remove}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
