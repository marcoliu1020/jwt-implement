import { setAccessToken } from "../tokenStore";
import { LOGIN_URL } from "../config";
import type { LoginRequest, LoginResponse, AccessToken } from "../types";

export async function login(payload: LoginRequest): Promise<AccessToken> {
	const res = await fetch(LOGIN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include", // allow backend to set refresh token cookie
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error("login failed");
	}

	const data = (await res.json()) as LoginResponse;
	setAccessToken(data.accessToken);
	return data.accessToken;
}
