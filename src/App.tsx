import { useEffect } from "react";
import { refreshAccessToken } from "./auth";

export default function App() {
  useEffect(() => {
    void refreshAccessToken();
  }, []);

  return <div>My App</div>;
}
