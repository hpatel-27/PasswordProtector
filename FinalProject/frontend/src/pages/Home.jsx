import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/client.js";
import useRequireAuth from "../hooks/useRequireAuth.js";
import AccountCard from "../components/AccountCard.jsx";
import Modal from "../components/Modal.jsx";

const logo = "/images/managerlogomedium.png";

export default function Home() {
  const user = useRequireAuth();
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [siteName, setSiteName] = useState("");
  const [accounts, setAccounts] = useState([]);

  // Modal state
  const [promptOpen, setPromptOpen] = useState(false);
  const [newProviderName, setNewProviderName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadAccounts = useCallback((providerId) => {
    if (providerId == null) {
      setAccounts([]);
      return;
    }
    api
      .getAccounts(providerId)
      .then(setAccounts)
      .catch(() => toast.error("Could not load accounts"));
  }, []);

  // Load the user's providers once authenticated; select the first by default.
  useEffect(() => {
    if (!user) return;
    api
      .getAllProviders()
      .then((list) => {
        setProviders(list);
        setSelectedProviderId(
          (current) => current ?? (list.length ? list[0].id : null),
        );
      })
      .catch(() => toast.error("Could not load your providers"));
  }, [user]);

  // Whenever the selected provider changes, sync the name field and accounts.
  useEffect(() => {
    if (selectedProviderId == null) {
      setSiteName("");
      setAccounts([]);
      return;
    }
    const provider = providers.find((p) => p.id === selectedProviderId);
    if (provider) setSiteName(provider.name);
    loadAccounts(selectedProviderId);
  }, [selectedProviderId, providers, loadAccounts]);

  const selectProvider = (provider) => setSelectedProviderId(provider.id);

  const openNewProvider = () => {
    setNewProviderName("");
    setPromptOpen(true);
  };

  const submitNewProvider = async (e) => {
    e.preventDefault();
    const name = newProviderName.trim();
    if (!name) return;
    setPromptOpen(false);
    const request = api.createProvider(name);
    toast.promise(request, {
      loading: "Adding provider…",
      success: `Added ${name}`,
      error: "Could not add provider",
    });
    try {
      const created = await request;
      const list = await api.getAllProviders();
      setProviders(list);
      setSelectedProviderId(created.id);
    } catch {
      /* toast already reported the failure */
    }
  };

  const confirmDeleteProvider = async () => {
    setConfirmOpen(false);
    if (selectedProviderId == null) return;
    const request = api.deleteProvider(selectedProviderId);
    toast.promise(request, {
      loading: "Deleting provider…",
      success: "Provider deleted",
      error: "Could not delete provider",
    });
    try {
      await request;
      const list = await api.getAllProviders();
      setProviders(list);
      setSelectedProviderId(list.length ? list[0].id : null);
    } catch {
      /* handled by toast */
    }
  };

  const handleUpdateProvider = async () => {
    if (selectedProviderId == null) return;
    const request = api.editProviderName(siteName, selectedProviderId);
    toast.promise(request, {
      loading: "Saving…",
      success: "Provider name updated",
      error: "Could not update provider",
    });
    try {
      await request;
      const list = await api.getAllProviders();
      setProviders(list);
    } catch {
      /* handled by toast */
    }
  };

  const handleNewAccount = () => {
    if (selectedProviderId == null) return;
    setAccounts((prev) => [
      ...prev,
      { id: null, username: "", password: "", notes: "" },
    ]);
  };

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  return (
    <div className="flex min-h-screen bg-slate-100 max-md:flex-col">
      <aside className="sticky top-0 flex h-screen w-65 shrink-0 flex-col gap-4 self-start overflow-y-auto border-r border-slate-200 bg-white p-4 max-md:static max-md:h-auto max-md:w-full max-md:border-b max-md:border-r-0">
        <div className="flex items-center gap-2.5 px-1 pb-1 font-bold text-slate-900">
          <img src={logo} alt="" className="h-7 w-auto" />
          <span>Password Protector</span>
        </div>

        <button
          type="button"
          className="btn btn-primary w-full"
          id="new-group"
          onClick={openNewProvider}
        >
          New provider
        </button>

        <nav className="flex flex-col gap-1 max-md:flex-row max-md:flex-wrap">
          {providers.length === 0 && (
            <p className="m-0 p-1 text-sm text-slate-500">No providers yet.</p>
          )}
          {providers.map((provider) => {
            const active = provider.id === selectedProviderId;
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => selectProvider(provider)}
                className={`w-full rounded-md border border-transparent px-3 py-2.5 text-left text-[0.95rem] font-medium transition-colors max-md:w-auto cursor-pointer ${
                  active
                    ? "bg-ocean-600 text-white hover:bg-ocean-700"
                    : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                {provider.name}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 px-8 pb-12 pt-6 max-md:px-4">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="truncate text-2xl">
            {selectedProvider ? selectedProvider.name : "Your vault"}
          </h1>
          <Link
            to="/profile"
            className="btn btn-secondary"
            id="profile-container"
            role="button"
          >
            Profile
          </Link>
        </header>

        {selectedProviderId == null ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            <p className="m-0">
              Select a provider on the left, or add a new one to get started.
            </p>
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="min-w-55 flex-1">
                <label className="field-label" htmlFor="site-name">
                  Provider name
                </label>
                <input
                  id="site-name"
                  className="input font-semibold"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              <div className="flex gap-2.5 max-md:w-full max-md:*:flex-1">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleUpdateProvider}
                >
                  Save name
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setConfirmOpen(true)}
                >
                  Delete provider
                </button>
              </div>
            </div>

            <div className="my-4 flex items-center justify-between gap-4">
              <h2 className="text-lg">Accounts</h2>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNewAccount}
              >
                New account
              </button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {accounts.length === 0 && (
                <p className="m-0 py-2 text-slate-500">
                  No accounts stored for this provider yet.
                </p>
              )}
              {accounts.map((account, index) => (
                <AccountCard
                  key={account.id ?? `draft-${index}`}
                  account={account}
                  providerId={selectedProviderId}
                  onChanged={() => loadAccounts(selectedProviderId)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Modal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        title="New provider"
      >
        <form onSubmit={submitNewProvider}>
          <label className="field-label" htmlFor="new-provider-name">
            Provider name
          </label>
          <input
            id="new-provider-name"
            className="input"
            placeholder="e.g. GitHub"
            value={newProviderName}
            onChange={(e) => setNewProviderName(e.target.value)}
            autoFocus
          />
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPromptOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newProviderName.trim()}
            >
              Add provider
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete provider"
      >
        <p className="m-0 text-slate-600">
          Delete{" "}
          <span className="font-semibold text-slate-900">
            {selectedProvider?.name}
          </span>{" "}
          and all of its accounts? This can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={confirmDeleteProvider}
          >
            Delete provider
          </button>
        </div>
      </Modal>
    </div>
  );
}
