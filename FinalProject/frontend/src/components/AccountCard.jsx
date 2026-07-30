import { useState } from 'react';
import { toast } from 'sonner';
import api from '../api/client.js';

// A single account entry. Handles both a brand-new draft (account.id == null,
// saved via create) and an existing account (saved via update).
export default function AccountCard({ account, providerId, onChanged }) {
  const [username, setUsername] = useState(account.username || '');
  const [password, setPassword] = useState(account.password || '');
  const [notes, setNotes] = useState(account.notes || '');
  const [showPassword, setShowPassword] = useState(account.id == null);

  const isDraft = account.id == null;

  const save = () => {
    const request = isDraft
      ? api.createAccount(providerId, username, password, notes)
      : api.updateAccount(providerId, account.id, username, password, notes);

    toast.promise(request, {
      loading: 'Saving account…',
      success: isDraft ? 'Account added' : 'Account saved',
      error: 'Could not save account'
    });
    request.then(() => onChanged()).catch(() => {});
  };

  const remove = () => {
    if (isDraft) {
      // Unsaved draft — just drop it from the list.
      onChanged();
      return;
    }
    const request = api.deleteAccount(providerId, account.id);
    toast.promise(request, {
      loading: 'Deleting account…',
      success: 'Account deleted',
      error: 'Could not delete account'
    });
    request.then(() => onChanged()).catch(() => {});
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3.5 p-[18px]">
        <div>
          <label className="field-label">Username</label>
          <input
            type="text"
            name="mainUsername"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">Password</label>
          <div className="flex gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              name="mainPassword"
              className="input flex-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="shrink-0 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label className="field-label">Notes</label>
          <textarea
            name="mainNotes"
            className="input min-h-[72px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2.5 border-t border-slate-200 bg-slate-50 p-[18px]">
        <button type="button" className="btn btn-primary flex-1" onClick={save}>
          {isDraft ? 'Add account' : 'Save'}
        </button>
        <button type="button" className="btn btn-danger flex-1" onClick={remove}>
          Delete
        </button>
      </div>
    </div>
  );
}
