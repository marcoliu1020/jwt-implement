import { getAccessToken, clearAccessToken } from "../tokenStore";
import { refreshAccessToken } from "./refreshAccessToken";
import { LOGIN_PATH } from "../config";
import type { AccessToken } from "../types";

let refreshPromise: Promise<AccessToken | null> | null = null;

/**
 * 發送帶有身份驗證標頭的 HTTP 請求。
 *
 * 此函數會自動處理 token 刷新邏輯：
 * - 如果請求返回 401 未授權狀態，會自動嘗試刷新 access token
 * - 刷新成功後會使用新的 token 重新發送請求
 * - 如果刷新失敗，會清除 token 並重定向到登入頁面
 * - 使用 Promise 確保同時發生的多個請求只會觸發一次 token 刷新
 *
 * @param url - 請求的 URL 位址
 * @param init - fetch API 的請求配置選項，預設為空物件
 * @returns 返回 fetch 的 Response 物件
 * @throws 當 token 刷新失敗時拋出 "Unauthorized" 錯誤
 *
 * @example
 * ```typescript
 * const response = await fetchWithAuth('https://api.example.com/data');
 * const data = await response.json();
 * ```
 */
export async function fetchWithAuth(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const res = await fetch(url, withAuthHeader(init));

  if (res.status !== 401) return res;

  // 👇 下面是處理 token 過期的流程
  // 👇 下面是處理 token 過期的流程
  // 👇 下面是處理 token 過期的流程

  // 如果還沒有正在進行的刷新請求，才發起新的刷新請求
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  // 所有同時發生的請求都會等這個 Promise
  const newToken = await refreshPromise;

  // 如果刷新失敗，清除 token 並導向登入頁面
  if (!newToken) {
    clearAccessToken();
    window.location.href = LOGIN_PATH;
    throw new Error("Unauthorized");
  }

  // 使用新的 token 重新發送請求
  return fetch(url, withAuthHeader(init));
}

// --------------------------------------------------------------------------------------------------------

function withAuthHeader(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}
