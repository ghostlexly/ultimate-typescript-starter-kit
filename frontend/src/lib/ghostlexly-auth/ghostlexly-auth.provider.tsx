"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { removeServerTokens, getSession } from "./ghostlexly-auth.server";
import { refreshClientTokens } from "./ghostlexly-auth.client";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionData = {
  status: SessionStatus;
  data: any;
};

type AuthContextProps = {
  status: SessionStatus;
  data: any;
  destroy: () => void;
};

// Create the context with default values
const AuthContext = createContext<AuthContextProps>({
  status: "loading",
  data: null,
  destroy: () => {},
});

// Custom hook to access auth context
const useSession = (): AuthContextProps => useContext(AuthContext);

type ProviderProps = {
  children: ReactNode;
};

const GhostlexlyAuthProvider = ({ children }: ProviderProps) => {
  const [sessionData, setSessionData] = useState<SessionData>({
    status: "loading",
    data: null,
  });

  // Automatic refresh of tokens
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshClientTokens();
      },
      1000 * 60 * 5 // 5 minutes
    );

    return () => clearInterval(interval);
  }, []);

  // Load user session when component mounts or status changes to loading
  useEffect(() => {
    if (sessionData.status === "loading") {
      getSession().then(setSessionData);
    }
  }, [sessionData.status]);

  const destroy = () => {
    removeServerTokens();
    setSessionData({ status: "unauthenticated", data: null });
  };

  return (
    <AuthContext.Provider
      value={{
        status: sessionData.status,
        data: sessionData.data,
        destroy,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { GhostlexlyAuthProvider, useSession };
