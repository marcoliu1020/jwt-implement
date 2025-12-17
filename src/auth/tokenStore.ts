import type { AccessToken } from "./types";

let accessToken: AccessToken = "";

export function setAccessToken(token: AccessToken): void {
  accessToken = token;
}

export function getAccessToken(): AccessToken {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = "";
}
