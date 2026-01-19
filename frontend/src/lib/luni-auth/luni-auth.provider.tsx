"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { clearAuthCookies, getServerSession } from "./luni-auth.server";

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
  initialSession: SessionData;
};

const LuniAuthProvider = ({ children, initialSession }: ProviderProps) => {
  const [sessionData, setSessionData] = useState<SessionData>(initialSession);

  const destroy = () => {
    clearAuthCookies();
    setSessionData({ status: "unauthenticated", data: null });
  };

  const refresh = async () => {
    const newSession = await getServerSession();
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

export { LuniAuthProvider, useSession };
export type { SessionData };
