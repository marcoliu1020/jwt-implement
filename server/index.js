import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || "dev-access-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Demo user store (replace with DB in production)
const demoUser = {
  id: "user-1",
  email: "test@test.com",
  password: "123456",
  name: "Test User",
};

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    {
      expiresIn: ACCESS_EXPIRES_IN,
    },
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // align with REFRESH_EXPIRES_IN default
    path: "/",
  });
}

function verifyAccess(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "Missing token" });

  const token = auth.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  if (email !== demoUser.email || password !== demoUser.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = signAccessToken(demoUser);
  const refreshToken = signRefreshToken(demoUser);
  setRefreshCookie(res, refreshToken);
  return res.json({ accessToken });
});

app.post("/auth/refresh", (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    if (payload.sub !== demoUser.id) throw new Error("Unknown user");

    const newAccess = signAccessToken(demoUser);
    const newRefresh = signRefreshToken(demoUser);
    setRefreshCookie(res, newRefresh);
    return res.json({ accessToken: newAccess });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

app.post("/auth/logout", (_req, res) => {
  res.clearCookie("refreshToken", { path: "/" });
  return res.status(204).end();
});

app.get("/auth/me", verifyAccess, (req, res) => {
  return res.json({ user: req.user });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
