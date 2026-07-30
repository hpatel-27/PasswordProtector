import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/client.js";
import useRequireAuth from "../hooks/useRequireAuth.js";
import PageHeader from "../components/PageHeader.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const user = useRequireAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
    }
  }, [user]);

  const signOut = (e) => {
    e.preventDefault();
    const request = api.logOut();
    toast.promise(request, {
      loading: "Signing out…",
      success: "Signed out",
      error: "Unable to sign out",
    });
    request.then(() => navigate("/login")).catch(() => {});
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <PageHeader to="/home" />

      <main className="flex flex-1 items-start justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
          <div className="mb-6">
            <h1 className="text-2xl">Profile</h1>
            <p className="mt-1 text-slate-500">Your account details</p>
          </div>

          <div className="mb-4.5">
            <label className="field-label" htmlFor="email-field">
              Email
            </label>
            <input
              id="email-field"
              type="email"
              placeholder="Enter email here"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4.5">
            <label className="field-label" htmlFor="user-field">
              Username
            </label>
            <input
              id="user-field"
              type="text"
              placeholder="Enter username here"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mt-7 flex gap-3 border-t border-slate-200 pt-6">
            <Link to="/home" className="btn btn-secondary flex-1">
              Back to vault
            </Link>
            <a
              href="/login"
              className="btn btn-danger flex-1"
              id="sign-out"
              role="button"
              onClick={signOut}
            >
              Sign out
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
