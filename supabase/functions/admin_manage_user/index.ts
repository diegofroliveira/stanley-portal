
// supabase/functions/admin_manage_user/index.ts
import { getCorsHeaders } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/json.ts";
import { createAdminClient, createCallerClient } from "../_shared/supabaseAdmin.ts";
import { requireTenantAdmin, requirePlatformAdmin } from "../_shared/authGuards.ts";

interface Body {
  action: "create" | "update" | "remove";
  tenant_id: string;
  user_id?: string;
  email?: string;
  password?: string;
  role?: "admin" | "manager" | "operator";
  permissions?: {
    menus: string[];
    actions: string[];
  };
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return errorResponse("method_not_allowed", 405, cors);

  let body: Body;
  try { body = await req.json(); } catch { return errorResponse("invalid_json", 400, cors); }
  
  if (!body.action || !body.tenant_id) return errorResponse("missing_fields", 400, cors);

  const caller = createCallerClient(req);
  
  // Check if caller is platform admin OR tenant admin
  const platformGuard = await requirePlatformAdmin(caller);
  const isPlatformAdmin = !("error" in platformGuard);
  
  if (!isPlatformAdmin) {
    const tenantGuard = await requireTenantAdmin(caller, body.tenant_id);
    if ("error" in tenantGuard) return errorResponse("unauthorized", 403, cors);
  }

  const admin = createAdminClient();

  if (body.action === "create") {
    if (!body.email || !body.password || !body.role) return errorResponse("missing_fields_for_create", 400, cors);
    
    // 1. Create user in Auth
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true
    });

    if (createError) {
        if (createError.message.includes("already been registered")) {
            // User exists, find them
            const { data: users } = await admin.auth.admin.listUsers();
            const existing = users.users.find(u => u.email === body.email);
            if (existing) {
                // Link existing user to tenant
                const { error: linkError } = await admin.from("tenant_members").upsert({
                    tenant_id: body.tenant_id,
                    user_id: existing.id,
                    role: body.role,
                    permissions: body.permissions || { menus: [], actions: [] }
                });
                if (linkError) return errorResponse(linkError.message, 500, cors);
                return jsonResponse({ success: true, user_id: existing.id, linked: true }, { status: 200 }, cors);
            }
        }
        return errorResponse(createError.message, 500, cors);
    }

    // 2. Link to tenant
    const { error: linkError } = await admin.from("tenant_members").insert({
      tenant_id: body.tenant_id,
      user_id: newUser.user.id,
      role: body.role,
      permissions: body.permissions || { menus: [], actions: [] }
    });

    if (linkError) return errorResponse(linkError.message, 500, cors);

    return jsonResponse({ success: true, user_id: newUser.user.id }, { status: 201 }, cors);
  }

  if (body.action === "update") {
    if (!body.user_id || !body.role) return errorResponse("missing_fields_for_update", 400, cors);

    const { error: updateError } = await admin
      .from("tenant_members")
      .update({
        role: body.role,
        permissions: body.permissions
      })
      .eq("tenant_id", body.tenant_id)
      .eq("user_id", body.user_id);

    if (updateError) return errorResponse(updateError.message, 500, cors);

    return jsonResponse({ success: true }, { status: 200 }, cors);
  }

  if (body.action === "remove") {
    if (!body.user_id) return errorResponse("missing_user_id_for_remove", 400, cors);

    const { error: removeError } = await admin
      .from("tenant_members")
      .delete()
      .eq("tenant_id", body.tenant_id)
      .eq("user_id", body.user_id);

    if (removeError) return errorResponse(removeError.message, 500, cors);

    return jsonResponse({ success: true }, { status: 200 }, cors);
  }

  return errorResponse("invalid_action", 400, cors);
});
