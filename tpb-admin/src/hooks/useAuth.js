import { useCallback, useEffect, useState } from "react";
import api from "../api";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    await api.post("/auth/login", { email, password });
    await refresh();
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return { user, ready, login, logout, isAuthed: !!user };
}
