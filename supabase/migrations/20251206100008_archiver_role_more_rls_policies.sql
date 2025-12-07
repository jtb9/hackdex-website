-- Archivers can view covers for archive hacks (including unapproved ones)
CREATE POLICY "Archivers can view covers for archive hacks." ON "public"."hack_covers" FOR SELECT USING (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("hack_slug")));

-- Archivers can view tags for archive hacks (including unapproved ones)
CREATE POLICY "Archivers can view tags for archive hacks." ON "public"."hack_tags" FOR SELECT USING (("public"."is_archiver"() AND "public"."is_archive_hack_for_archiver"("hack_slug")));

