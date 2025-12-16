import type { AccessToken } from './types'

let accessToken: AccessToken | null = null;

export function setAccessToken(token: AccessToken | null): void {
    accessToken = token;
}

export function getAccessToken(): AccessToken | null {
    return accessToken;
}

export function clearAccessToken(): void {
    accessToken = null;
}
