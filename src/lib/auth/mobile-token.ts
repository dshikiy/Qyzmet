import crypto from "node:crypto";
import type { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface MobileJwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured on the server.");
  }
  return secret;
}

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + "=".repeat(padLen), "base64").toString("utf8");
}

export function signMobileToken(user: AuthenticatedUser): {
  accessToken: string;
  expiresAt: string;
} {
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + TOKEN_TTL_SECONDS;
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: nowSec,
      exp: expSec,
    } satisfies MobileJwtPayload)
  );

  const signingInput = `${header}.${payload}`;
  const signature = base64UrlEncode(
    crypto.createHmac("sha256", getSecret()).update(signingInput).digest()
  );

  return {
    accessToken: `${signingInput}.${signature}`,
    expiresAt: new Date(expSec * 1000).toISOString(),
  };
}

export function verifyMobileToken(token: string): MobileJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, sig] = parts;
    const expectedSig = base64UrlEncode(
      crypto.createHmac("sha256", getSecret()).update(`${header}.${payload}`).digest()
    );
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const decoded = JSON.parse(base64UrlDecode(payload)) as MobileJwtPayload;
    if (!decoded.sub || typeof decoded.exp !== "number") return null;
    if (decoded.exp <= Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Resolves the authenticated user from either:
 * 1) Authorization: Bearer <mobile-jwt> header (React Native / Mobile clients), OR
 * 2) Existing NextAuth HTTP-only session cookie (Web browser clients).
 */
export async function getRequestUser(request?: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request?.headers.get("authorization") || request?.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const rawToken = authHeader.slice(7).trim();
    const payload = verifyMobileToken(rawToken);
    if (!payload) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true },
    });
    return dbUser ?? null;
  }

  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

