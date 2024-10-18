"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createSession,
  destroySession,
  getSession,
} from "./ghostlexly-auth.server";

type CreateProps = {
  value: string;
};

type SessionData = {
  status: SessionStatus;
  data: any;
};

type GhostlexlyAuthContextProps = {
  status: SessionStatus;
  data: any;
  create: ({ value }: CreateProps) => void;
  destroy: () => void;
};

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

const useSession = (): GhostlexlyAuthContextProps => {
  return useContext(GhostlexlyAuthContext);
};

const GhostlexlyAuthContext = createContext({
  status: "loading" as SessionStatus,
  data: null,
  create: ({ value }: CreateProps) => {},
  destroy: () => {},
});

const GhostlexlyAuthProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState<SessionData>({
    status: "loading",
    data: null,
  });

  useEffect(() => {
    if (sessionData.status === "loading") {
      // Refresh session data from endpoint
      getSession().then((data) => {
        setSessionData(data);
      });
    }
  }, [sessionData.status]);

  const create = ({ value }: CreateProps) => {
    createSession(value);

    setSessionData({
      status: "loading",
      data: null,
    });
  };

  const destroy = () => {
    destroySession();

    setSessionData({
      status: "unauthenticated",
      data: null,
    });
  };

  return (
    <GhostlexlyAuthContext.Provider
      value={{
        status: sessionData.status,
        data: sessionData.data,
        create,
        destroy,
      }}
    >
      {children}
    </GhostlexlyAuthContext.Provider>
  );
};

export { GhostlexlyAuthProvider, useSession };
