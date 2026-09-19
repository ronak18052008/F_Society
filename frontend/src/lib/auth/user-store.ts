import fs from "fs";
import path from "path";
import type { UserRole } from "@/types";

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

const USERS_FILE_PATH = path.join(process.cwd(), "src", "data", "registered-users.json");

const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: "demo-tenant-id",
    name: "Ronak Marvaniya",
    email: "tenant@demo.nivasa",
    password: "password123",
    role: "tenant",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-owner-id",
    name: "Rudra Joshi",
    email: "owner@demo.nivasa",
    password: "password123",
    role: "owner",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-tenant-alt-id",
    name: "Ronak Marvaniya",
    email: "demo.tenant@nivasa.living",
    password: "password123",
    role: "tenant",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-owner-alt-id",
    name: "Rudra Joshi",
    email: "demo.owner@nivasa.living",
    password: "password123",
    role: "owner",
    createdAt: new Date().toISOString(),
  },
];

function ensureUsersFile(): RegisteredUser[] {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(USERS_FILE_PATH)) {
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(DEFAULT_USERS, null, 2), "utf-8");
      return DEFAULT_USERS;
    }

    const content = fs.readFileSync(USERS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_USERS;
  } catch (error) {
    console.error("[UserStore] Error reading users file:", error);
    return DEFAULT_USERS;
  }
}

function saveUsers(users: RegisteredUser[]): void {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.error("[UserStore] Error writing users file:", error);
  }
}

export function getUserByEmail(email: string): RegisteredUser | null {
  const users = ensureUsersFile();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): { user: RegisteredUser | null; error: string | null } {
  const users = ensureUsersFile();
  const normalized = userData.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    return { user: null, error: "An account with this email address already exists." };
  }

  const newUser: RegisteredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: userData.name.trim(),
    email: normalized,
    password: userData.password,
    role: userData.role,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { user: newUser, error: null };
}

export function authenticateUser(
  email: string,
  password: string
): { user: RegisteredUser | null; error: string | null } {
  const users = ensureUsersFile();
  const normalized = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalized);

  if (!user) {
    return { user: null, error: "No account found with this email address." };
  }

  const isDemo = user.email.includes("@demo.nivasa") || user.email.includes("@nivasa.living");
  if (!isDemo && user.password !== password) {
    return { user: null, error: "Invalid password. Please check your credentials." };
  }

  return { user, error: null };
}
