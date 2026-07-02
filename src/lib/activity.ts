import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Escribe una entrada en el log de actividad del backoffice.
 * Debe llamarse desde cualquier Server Action que realice una mutación.
 *
 * @param supabase  - cliente admin de Supabase (service_role)
 * @param adminName - nombre del administrador que realizó la acción
 * @param action    - código de acción en snake_case (ej. "created_purchase")
 * @param entityType - tipo de entidad afectada (ej. "purchase", "donation")
 * @param entityId  - UUID de la entidad afectada (null si no aplica)
 * @param description - descripción legible (ej. "Registró compra: 20 cajas de agua")
 * @param adminId   - UUID del admin en la tabla admin_users (opcional)
 */
export async function logActivity(
  supabase: SupabaseClient,
  adminName: string,
  action: string,
  entityType: string,
  description: string,
  entityId?: string | null,
  adminId?: string | null,
): Promise<void> {
  const { error } = await supabase.from("activity_log").insert({
    admin_id: adminId ?? null,
    admin_name: adminName,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    description,
  });

  if (error) {
    // El log no debe interrumpir el flujo principal
    console.warn("[ActivityLog] Failed to write activity:", error.message);
  }
}
