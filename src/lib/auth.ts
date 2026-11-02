import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "losandes-inmobiliaria-secure-jwt-secret-key-2026"
);

const COOKIE_NAME = "losandes_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Crea y firma un token JWT de sesion
export async function signSessionToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verifica y decodifica el token de sesion
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// Inicia sesion validando credenciales y creando la cookie
export async function loginUser(
  email: string,
  plainPassword: string
): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.isActive) {
    return { success: false, error: "Credenciales inválidas o usuario inactivo." };
  }

  const isPasswordValid = await bcrypt.compare(plainPassword, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: "Credenciales inválidas." };
  }

  const sessionPayload: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = await signSessionToken(sessionPayload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true, user: sessionPayload };
}

// Cierra la sesion eliminando la cookie
export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Obtiene el usuario autenticado actual desde las cookies
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

