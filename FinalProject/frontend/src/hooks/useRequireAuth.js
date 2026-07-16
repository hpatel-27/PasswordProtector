import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

// Loads the current user; redirects to /login on a 401. Returns the user once
// known (null while loading). Mirrors the old common.js guard.
export default function useRequireAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .getCurrentUser()
      .then(setUser)
      .catch((error) => {
        if (error.status === 401) {
          navigate('/login');
        } else {
          console.error(error.status, error);
        }
      });
  }, [navigate]);

  return user;
}
