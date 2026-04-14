import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

export const supabaseStorageBucket =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || "car-images";

export function isSupabaseEnabled() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function getSupabaseAdminClient() {
  if (!isSupabaseEnabled()) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSupabaseStorageObjectPath(publicUrl: string) {
  if (!supabaseUrl) {
    return null;
  }

  try {
    const appUrl = new URL(supabaseUrl);
    const assetUrl = new URL(publicUrl);
    const prefix = `/storage/v1/object/public/${supabaseStorageBucket}/`;

    if (appUrl.hostname !== assetUrl.hostname || !assetUrl.pathname.startsWith(prefix)) {
      return null;
    }

    return decodeURIComponent(assetUrl.pathname.slice(prefix.length));
  } catch {
    return null;
  }
}
