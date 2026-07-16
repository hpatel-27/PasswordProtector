import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import useRequireAuth from '../hooks/useRequireAuth.js';
import AccountCard from '../components/AccountCard.jsx';
import '../styles/home.css';

export default function Home() {
  const user = useRequireAuth();
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [siteName, setSiteName] = useState('');
  const [accounts, setAccounts] = useState([]);

  const loadAccounts = useCallback((providerId) => {
    if (providerId == null) {
      setAccounts([]);
      return;
    }
    api.getAccounts(providerId).then(setAccounts).catch((err) => console.error('Error', err));
  }, []);

  // Load the user's providers once authenticated; select the first by default.
  useEffect(() => {
    if (!user) return;
    api.getAllProviders().then((list) => {
      setProviders(list);
      setSelectedProviderId((current) => current ?? (list.length ? list[0].id : null));
    });
  }, [user]);

  // Whenever the selected provider changes, sync the name field and accounts.
  useEffect(() => {
    if (selectedProviderId == null) {
      setSiteName('');
      setAccounts([]);
      return;
    }
    const provider = providers.find((p) => p.id === selectedProviderId);
    if (provider) setSiteName(provider.name);
    loadAccounts(selectedProviderId);
  }, [selectedProviderId, providers, loadAccounts]);

  const selectProvider = (provider) => setSelectedProviderId(provider.id);

  const handleNewProvider = async () => {
    const name = window.prompt("Please enter the provider's name:", 'Type here');
    if (!name) return;
    try {
      const created = await api.createProvider(name);
      const list = await api.getAllProviders();
      setProviders(list);
      setSelectedProviderId(created.id);
    } catch (err) {
      console.error('Error', err);
    }
  };

  const handleDeleteProvider = async () => {
    if (selectedProviderId == null) return;
    try {
      await api.deleteProvider(selectedProviderId);
      const list = await api.getAllProviders();
      setProviders(list);
      setSelectedProviderId(list.length ? list[0].id : null);
    } catch (err) {
      console.error('Error', err);
    }
  };

  const handleUpdateProvider = async () => {
    if (selectedProviderId == null) return;
    try {
      await api.editProviderName(siteName, selectedProviderId);
      const list = await api.getAllProviders();
      setProviders(list);
    } catch (err) {
      console.error('Error', err);
    }
  };

  const handleNewAccount = () => {
    if (selectedProviderId == null) return;
    setAccounts((prev) => [...prev, { id: null, username: '', password: '', notes: '' }]);
  };

  return (
    <div className="home-container">
      <div className="side-bar">
        <button type="button" className="new-group-btn" id="new-group" onClick={handleNewProvider}>
          New Provider
        </button>
        <div className="side">
          <div className="sidebar">
            {providers.map((provider) => (
              <a
                key={provider.id}
                className="btn btn-primary prv-btn"
                role="button"
                onClick={() => selectProvider(provider)}
              >
                {provider.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="main-header">
          <Link to="/profile" className="profile-btn btn btn-primary" id="profile-container" role="button">
            Profile
          </Link>
        </div>

        <div className="account-management">
          <div className="account-header">
            <input
              className="site-name-btn"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
            <button type="button" className="new-account-btn" onClick={handleNewAccount}>
              New Account
            </button>
          </div>
          <div className="accounts">
            <div className="account-section main-account">
              <div className="card-container">
                {accounts.map((account, index) => (
                  <AccountCard
                    key={account.id ?? `draft-${index}`}
                    account={account}
                    providerId={selectedProviderId}
                    onChanged={() => loadAccounts(selectedProviderId)}
                  />
                ))}
              </div>

              <button type="button" className="del-provider-btn" onClick={handleDeleteProvider}>
                Delete Provider
              </button>
              <button type="button" className="update-provider-btn" onClick={handleUpdateProvider}>
                Update Provider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
