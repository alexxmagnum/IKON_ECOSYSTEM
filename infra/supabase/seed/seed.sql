-- MotanOS Phase 3 — identity reference seed
-- No real users. Roles/permissions catalog only (DEC-002 aligned).

INSERT INTO public.roles (id, name) VALUES
  ('11111111-1111-1111-1111-111111111001', 'Platform Admin'),
  ('11111111-1111-1111-1111-111111111002', 'Club Admin'),
  ('11111111-1111-1111-1111-111111111003', 'Staff'),
  ('11111111-1111-1111-1111-111111111004', 'Member'),
  ('11111111-1111-1111-1111-111111111005', 'Organizer'),
  ('11111111-1111-1111-1111-111111111006', 'Guest')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (id, key) VALUES
  ('22222222-2222-2222-2222-222222222001', 'platform.admin.access'),
  ('22222222-2222-2222-2222-222222222002', 'club.admin.access'),
  ('22222222-2222-2222-2222-222222222003', 'staff.operate'),
  ('22222222-2222-2222-2222-222222222004', 'member.access'),
  ('22222222-2222-2222-2222-222222222005', 'organizer.manage'),
  ('22222222-2222-2222-2222-222222222006', 'guest.browse')
ON CONFLICT (key) DO NOTHING;
