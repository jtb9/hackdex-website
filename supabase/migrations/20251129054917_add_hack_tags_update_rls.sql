create policy "Owners can update tags on own hacks."
  on "public"."hack_tags"
  as PERMISSIVE
  for UPDATE
  to public
  using (
    (is_admin() OR (EXISTS ( SELECT 1
    FROM hacks h
    WHERE ((h.slug = hack_tags.hack_slug) AND (h.created_by = auth.uid())))))
  );
