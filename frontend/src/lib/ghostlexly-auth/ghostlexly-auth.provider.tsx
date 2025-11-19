"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { removeServerTokens, getSession } from "./ghostlexly-auth.server";
import { wolfios } from "../wolfios";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionData = {
  status: SessionStatus;
  data: any;
};

type AuthContextProps = {
  status: SessionStatus;
  data: any;
  destroy: () => void;
  refresh: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextProps>({
  status: "loading",
  data: null,
  destroy: () => {},
  refresh: async () => {},
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
      async () => {
        if (sessionData.status === "authenticated") {
          await wolfios.post("/api/auth/refresh");
        }
      },
      1000 * 60 * 5 // 5 minutes
    );

    return () => clearInterval(interval);
  }, [sessionData.status]);

  // Load user session when component mounts or status changes to loading
  useEffect(() => {
    if (sessionData.status === "loading") {
      refresh();
    }
  }, [sessionData.status]);

  const destroy = () => {
    removeServerTokens();
    setSessionData({ status: "unauthenticated", data: null });
  };

  const refresh = async () => {
    const newSession = await getSession();
    setSessionData(newSession);
  };

  return (
    <AuthContext.Provider
      value={{
        status: sessionData.status,
        data: sessionData.data,
        destroy,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { GhostlexlyAuthProvider, useSession };
