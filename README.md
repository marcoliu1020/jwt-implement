**Overview**

- 簡易 JWT + Refresh Token 的前後端示範。前端以 Vite + React 實作，後端以 Express 提供登入、刷新、登出與受保護 API。

**如何啟動**

- 先安裝依賴：

```bash
npm install
```

- 啟動前後端（同時啟動 Vite 與 Express）：

```bash
npm run dev
```

- 預設連線：
  - 前端：http://localhost:5173
  - 後端：http://localhost:3000

- 可選環境變數（於啟動前設定）：
  - `PORT`：後端埠號，預設 `3000`
  - `JWT_SECRET`：Access Token 簽章 secret，預設 `dev-access-secret`
  - `REFRESH_SECRET`：Refresh Token 簽章 secret，預設 `dev-refresh-secret`
  - `ACCESS_EXPIRES_IN`：Access Token 存活時間，預設 `15m`
  - `REFRESH_EXPIRES_IN`：Refresh Token 存活時間，預設 `7d`
  - `CLIENT_ORIGIN`：允許 CORS 的前端來源，預設 `http://localhost:5173`

**JWT 流程機制**

- **登入**：
  - 前端呼叫 [src/auth/api/login.ts](src/auth/api/login.ts) 以帳密登入。
  - 後端簽發短效 `accessToken`（JSON 回傳）與長效 `refreshToken`（寫入 httpOnly Cookie）。
  - 前端僅把 `accessToken` 存在記憶體（避免長期存放在 localStorage）。
- **帶 Token 呼叫 API**：
  - 透過 [src/auth/api/fetchWithAuth.ts](src/auth/api/fetchWithAuth.ts) 自動加上 `Authorization: Bearer <accessToken>`。
- **自動刷新**：
  - 若回應為 401，`fetchWithAuth()` 會以 httpOnly 的 `refreshToken` 呼叫 [src/auth/api/refreshAccessToken.ts](src/auth/api/refreshAccessToken.ts) 取得新的 `accessToken`，並以新 Token 重試原請求。
  - 透過一個全域 `refreshPromise`，多個同時 401 的請求只會觸發一次刷新動作（請求合併）。
- **登出**：
  - 呼叫後端 `/auth/logout` 清除 `refreshToken` Cookie，前端同時清空記憶體中的 `accessToken`。
- **頁面載入初始化**：
  - 前端在 App 啟動時先嘗試 `refreshAccessToken()`，若成功即可無縫登入狀態；若失敗則呈現登入頁。

**前端 `src/auth` 說明**

- [src/auth/config.ts](src/auth/config.ts)
  - 定義端點與路徑：`API_BASE`、`LOGIN_URL`、`REFRESH_URL`、`LOGIN_PATH`。
- [src/auth/tokenStore.ts](src/auth/tokenStore.ts)
  - 以記憶體儲存 `accessToken`：`setAccessToken()`、`getAccessToken()`、`clearAccessToken()`。
- [src/auth/api/login.ts](src/auth/api/login.ts)
  - `login(payload)`：以帳密登入，成功後更新 `accessToken` 並回傳。
- [src/auth/api/refreshAccessToken.ts](src/auth/api/refreshAccessToken.ts)
  - `refreshAccessToken()`：以 Cookie 中的 `refreshToken` 向後端換新 `accessToken`，成功即更新記憶體。
- [src/auth/api/fetchWithAuth.ts](src/auth/api/fetchWithAuth.ts)
  - `fetchWithAuth(url, init)`：封裝 `fetch`，自動帶上 `Authorization`，401 時觸發刷新並重試；刷新失敗導向登入頁。
- [src/auth/types.d.ts](src/auth/types.d.ts)
  - 型別定義（`AccessToken`、請求/回應 payload）。

**後端 `server/index.js` 說明**

- CORS 與中介軟體：
  - 允許 `CLIENT_ORIGIN` 與 `credentials`，使用 `express.json()`、`cookie-parser`。
- Token 簽署/驗證：
  - `signAccessToken(user)`：以 `JWT_SECRET` 簽發短效 Access Token（含 `sub`, `email`, `name`）。
  - `signRefreshToken(user)`：以 `REFRESH_SECRET` 簽發長效 Refresh Token（只含 `sub`）。
  - `setRefreshCookie(res, token)`：設定 httpOnly、`sameSite=lax` 的 `refreshToken` Cookie。
  - `verifyAccess` 中介：驗證 `Authorization: Bearer <token>`，驗證失敗回 401。
- 路由：
  - `POST /auth/login`：帳密驗證成功後，回傳 `accessToken` 並設定 `refreshToken` Cookie。
  - `POST /auth/refresh`：驗證 `refreshToken`，成功則回傳新 `accessToken` 並輪換新的 `refreshToken` Cookie。
  - `POST /auth/logout`：清除 `refreshToken` Cookie。
  - `GET /auth/me`：受保護路由，需附帶有效 `accessToken`。
  - `GET /health`：健康檢查。

**安全性備註**

- `accessToken` 存於記憶體，縮短暴露時間；`refreshToken` 以 httpOnly Cookie 存放，避免前端腳本讀取。
- 在正式環境建議：
  - 啟用 `secure` Cookie；
  - 使用強隨機的 `JWT_SECRET`/`REFRESH_SECRET`；
  - 適當的 Token 存活時間與輪轉策略；
  - 後端導入使用者與 Refresh Token 清單（資料庫）管理與撤銷。

**快速測試**

- 以預設測試帳號登入：
  - Email：`test@test.com`
  - Password：`123456`
- 登入後頁面會顯示從 Token 解析出的使用者資訊；若 Access Token 過期，請求會自動刷新後重試。
