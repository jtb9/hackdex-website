import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check if a user is admin or archiver
 */
export async function checkUserRoles(
  supabase: SupabaseClient<any>
): Promise<{
  isAdmin: boolean;
  isArchiver: boolean;
}> {
  const { data: claims } = await supabase.rpc("get_my_claims");
  return {
    isAdmin: claims?.claims_admin ?? false,
    isArchiver: claims?.archiver ?? false,
  };
}
