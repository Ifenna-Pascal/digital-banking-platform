import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setUnauthorizedHandler, tokenStore } from "../api/client";
import { Profile } from "../types";

interface AuthValue {
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStore.clear();
    setProfile(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setProfile(null);
      return;
    }
    const res = await api<{ user_profile_details: Profile }>(
      "/user/user_details"
    );
    setProfile(res.user_profile_details);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<{ data: { token: string } }>("/user/signin", {
        method: "POST",
        body: { email, password },
      });
      tokenStore.set(res.data.token);
      await refresh();
    },
    [refresh]
  );

  // restore the session from a saved token on first load
  useEffect(() => {
    setUnauthorizedHandler(logout);
    refresh()
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout, refresh]);

  const value = useMemo(
    () => ({ profile, loading, login, logout, refresh }),
    [profile, loading, login, logout, refresh]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
};
