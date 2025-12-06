-- Helper function to check if a hack qualifies for archiver access
-- SECURITY DEFINER allows this function to bypass RLS when checking hack properties,
-- preventing circular dependencies in RLS policies
CREATE OR REPLACE FUNCTION public.is_archive_hack_for_archiver(hack_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.hacks h
    WHERE h.slug = hack_slug
      AND h.original_author IS NOT NULL
      AND (h.current_patch IS NULL OR h.permission_from IS NOT NULL)
  );
$$;

-- Archivers can view archive hacks (including unapproved ones)
CREATE POLICY "Archivers can view archive hacks." ON "public"."hacks" FOR SELECT USING (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("slug")));

-- Archivers can update archive hacks
CREATE POLICY "Archivers can update archive hacks." ON "public"."hacks" FOR UPDATE USING (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("slug"))) WITH CHECK (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("slug")));

-- Archivers can delete archive hacks
CREATE POLICY "Archivers can delete archive hacks." ON "public"."hacks" FOR DELETE USING (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("slug")));

-- Archivers can add covers to archive hacks
CREATE POLICY "Archivers can add covers to archive hacks." ON "public"."hack_covers" FOR INSERT WITH CHECK (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("hack_slug")));

-- Archivers can remove covers from archive hacks
CREATE POLICY "Archivers can remove covers from archive hacks." ON "public"."hack_covers" FOR DELETE USING (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("hack_slug")));

-- Archivers can update covers on archive hacks
CREATE POLICY "Archivers can update covers on archive hacks." ON "public"."hack_covers" FOR UPDATE USING (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("hack_slug")));

-- Archivers can add tags to archive hacks
CREATE POLICY "Archivers can add tags to archive hacks." ON "public"."hack_tags" FOR INSERT WITH CHECK (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("hack_slug")));

-- Archivers can remove tags from archive hacks
CREATE POLICY "Archivers can remove tags from archive hacks." ON "public"."hack_tags" FOR DELETE USING (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("hack_slug")));
