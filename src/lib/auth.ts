import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "losandes-inmobiliaria-secure-jwt-secret-key-2026"
);

const COOKIE_NAME = "losandes_session";

// Duracion de la sesion: 8 horas (jornada laboral con expiracion estricta)
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Crea y firma un token JWT de sesion con expiracion estricta e identificador jti
export async function signSessionToken(payload: SessionUser): Promise<string> {
  const jti = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(JWT_SECRET);
}

// Verifica criptograficamente y decodifica el token de sesion comprobando expiracion
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (!payload || !payload.id || !payload.email || payload.role !== "ADMIN") {
      return null;
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    // Si el token expiro (JWTExpired) o fue manipulado, retorna null
    return null;
  }
}

// Inicia sesion validando credenciales contra bcrypt y emitiendo cookie segura httpOnly
export async function loginUser(
  email: string,
  plainPassword: string
): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Proteccion contra timing attacks: siempre ejecuta compare aunque no exista el usuario
  const dummyHash = "$2a$10$wT8vM9C7GZ1Q3w0O3o7pBeX7bF6X1gY4m0nL8pQ2rS4tU6vW8xYZa";
  const passwordToCompare = user ? user.passwordHash : dummyHash;
  const isPasswordValid = await bcrypt.compare(plainPassword, passwordToCompare);

  if (!user || !user.isActive || user.role !== "ADMIN" || !isPasswordValid) {
    return { success: false, error: "Credenciales inválidas o acceso administrativo no autorizado." };
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
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });

  return { success: true, user: sessionPayload };
}

// Cierra la sesion eliminando la cookie del navegador
export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Obtiene y valida el usuario actual comprobando tanto el JWT como la base de datos
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) {
    cookieStore.delete(COOKIE_NAME);
    return null;
  }

  // Verificacion en base de datos: confirma que el usuario siga activo y conserve el rol
  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  if (!dbUser || !dbUser.isActive || dbUser.role !== "ADMIN") {
    cookieStore.delete(COOKIE_NAME);
    return null;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  };
}

// Capa de autorizacion estricta (Data Access Layer) que aborta y redirige si no hay sesion
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
