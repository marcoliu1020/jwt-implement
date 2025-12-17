import { useEffect, useState } from "react";
import { getAccessToken, refreshAccessToken } from "./auth";
import Login from "./pages/Login";
import UserCard from "./components/UserCard";
import { sleep, flipCoin } from "./utils";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string>(getAccessToken());
  const jwtUser = decodeJwtToken(accessToken);

  // 啟動時刷新 token 流程
  useEffect(() => {
    procedure();

    async function procedure(): Promise<void> {
      setIsLoading(true);
      await sleep(1000); // TEST: 等待
      await reInitializeToken();
      setIsLoading(false);
    }

    async function reInitializeToken() {
      const accessToken = await refreshAccessToken();
      if (flipCoin()) return setAccessToken(""); // TEST: 刷新失敗
      if (flipCoin()) return setAccessToken("Invalid Token"); // TEST: 刷新失敗
      if (!accessToken) return setAccessToken("");
      return setAccessToken(accessToken);
    }
  }, []);

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!accessToken) {
    return <Login onSuccess={setAccessToken} />;
  }

  if (jwtUser.status === "failure") {
    return (
      <div style={{ padding: 24 }}>
        <h1>❌ Error decoding token</h1>
        <p>{jwtUser.error.message}</p>
      </div>
    );
  }

  if (jwtUser.status === "success") {
    return (
      <UserCard
        username={jwtUser.data.username}
        email={jwtUser.data.email} />
    );
  }

  return <div style={{ color: "red" }}>nothing to display</div>
}

// ----------------------------------------

type Success<T> = { status: "success"; data: T };
type Failure = { status: "failure"; error: Error };
type Result<T> = Success<T> | Failure;
type User = {
  username: string;
  email: string;
};

function decodeJwtToken(token: string): Result<User> {
  if (!token) return { status: "failure", error: new Error("No token provided") };

  const parts = token.split(".");
  if (parts.length < 2) {
    return { status: "failure", error: new Error("Invalid token format") };
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    const payload = JSON.parse(json) as Partial<User>;

    return {
      status: "success",
      data: {
        username: payload.username ?? "Unknown",
        email: payload.email ?? "Unknown",
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Failed to decode token");
    return { status: "failure", error: err };
  }
}
