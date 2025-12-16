import { setAccessToken } from "../tokenStore";
import { REFRESH_URL } from "../config";
import type { RefreshResponse, AccessToken } from "../types";

/**
 * 嘗試使用 refresh token（httpOnly cookie）換取新的 access token
 * @returns accessToken 或 null（代表 refresh 失敗）
 */
export async function refreshAccessToken(): Promise<AccessToken | null> {
  try {
    const res = await fetch(REFRESH_URL, {
      method: "POST",
      credentials: "include", // ⭐ 一定要
    });

    if (!res.ok) return null;

    const data = (await res.json()) as RefreshResponse;
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}
