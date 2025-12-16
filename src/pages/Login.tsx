import { useState } from "react";
import { login } from "../auth/api/login";

export default function Login() {
    const [email, setEmail] = useState("test@test.com");
    const [password, setPassword] = useState("123456");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (loading) return;
        setError(null);
        setLoading(true);
        try {
            await login({ email, password });
        } catch (err) {
            setError(err instanceof Error ? err.message : "login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: "4rem auto", padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <h1 style={{ marginBottom: "1rem" }}>登入</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #d1d5db" }}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>密碼</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #d1d5db" }}
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "0.6rem 0.75rem",
                        borderRadius: 8,
                        border: "none",
                        background: loading ? "#93c5fd" : "#3b82f6",
                        color: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: 600,
                    }}
                >
                    {loading ? "登入中..." : "登入"}
                </button>
                {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
            </form>
        </div>
    );
}
