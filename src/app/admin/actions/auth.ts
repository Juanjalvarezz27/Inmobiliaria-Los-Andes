"use server";

import { loginUser, logoutUser } from "@/lib/auth";
import { redirect } from "next/navigation";

// Accion de inicio de sesion para administradores
export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | never> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor ingrese su correo y contraseña." };
  }

  const result = await loginUser(email, password);
  if (!result.success) {
    return { error: result.error || "Error al autenticar." };
  }

  redirect("/admin");
}

// Accion de cierre de sesion seguro
export async function logoutAction() {
  await logoutUser();
  redirect("/admin/login");
}

