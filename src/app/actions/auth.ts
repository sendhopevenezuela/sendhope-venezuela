"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export type AuthResult =
  | { success: true }
  | { error: string };

/**
 * Inicia sesión para un administrador.
 * Llama al RPC verify_admin_password y si es correcto, crea un registro de sesión.
 */
export async function loginAdmin(
  formData: FormData
): Promise<AuthResult> {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Por favor, ingresa el usuario y la contraseña." };
  }

  const supabase = createAdminClient();

  // 1. Verificar credenciales mediante el RPC en la base de datos
  const { data: user, error: rpcError } = await supabase
    .rpc("verify_admin_password", {
      p_username: username,
      p_password: password,
    });

  if (rpcError) {
    console.error("[Auth Action] RPC Error:", rpcError);
    return { error: `Error de conexión: ${rpcError.message}` };
  }

  // user es un array porque returns table() devuelve filas
  const loggedUser = Array.isArray(user) ? user[0] : user;

  if (!loggedUser || !loggedUser.user_id) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  // 2. Crear sesión en la base de datos
  // Expira en 24 horas por defecto
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("admin_sessions")
    .insert({
      user_id: loggedUser.user_id,
      expires_at: expiresAt,
    })
    .select("token")
    .single();

  if (sessionError || !session?.token) {
    console.error("[Auth Action] Session Insertion Error:", sessionError);
    return { error: `No se pudo crear la sesión: ${sessionError?.message ?? "token no generado"}` };
  }

  // 3. Establecer la cookie de sesión
  const cookieStore = await cookies();
  cookieStore.set("sendhope_admin_session", session.token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24 horas en segundos
  });

  return { success: true };
}

/**
 * Cierra la sesión activa del administrador.
 * Remueve el registro de base de datos y limpia la cookie del cliente.
 */
export async function logoutAdmin(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sendhope_admin_session")?.value;

  if (token) {
    const supabase = createAdminClient();
    // Eliminar de base de datos
    await supabase.from("admin_sessions").delete().eq("token", token);
  }

  // Borrar cookie
  cookieStore.delete("sendhope_admin_session");

  return { success: true };
}

/**
 * Registra un nuevo administrador en la base de datos si el código secreto es correcto.
 */
export async function registerAdmin(
  formData: FormData
): Promise<AuthResult> {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const secretCode = formData.get("secretCode")?.toString().trim();

  if (!username || !password || !confirmPassword || !secretCode) {
    return { error: "Todos los campos son requeridos." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  if (secretCode !== "venezuela2026") {
    return { error: "El código de registro secreto es incorrecto." };
  }

  const supabase = createAdminClient();

  // 1. Verificar si el usuario ya existe
  const { data: existingUser, error: checkError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (checkError) {
    console.error("[Register Action] Check Username Error:", checkError);
    return { error: `Error de conexión: ${checkError.message}` };
  }

  if (existingUser) {
    return { error: "El nombre de usuario ya está registrado." };
  }

  // 2. Registrar al usuario mediante el RPC
  const { error: registerError } = await supabase
    .rpc("register_admin_user", {
      p_username: username,
      p_password: password,
    });

  if (registerError) {
    console.error("[Register Action] RPC Register Error:", registerError);
    return { error: `No se pudo registrar la cuenta: ${registerError.message}` };
  }

  return { success: true };
}

