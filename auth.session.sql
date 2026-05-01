INSERT INTO clients (id, secret, name, redirect_uris, allowed_scopes, is_active)
VALUES (
  gen_random_uuid(),
  'test-secret',
  'Test App',
  ARRAY['http://localhost:3001/callback'],
  ARRAY['openid', 'email', 'profile'],
  true
);


SELECT * FROM authorization_codes ORDER BY created_at DESC LIMIT 1;


INSERT INTO clients (secret, name, redirect_uris, allowed_scopes, is_active)
VALUES (
  '$2b$10$kHYeiiVFnJVHs03Hg1SZvuyz5/RKyMO1OxhO8I87LdMXT9N6J8DPq',
  'Test App',
  ARRAY['http://localhost:3001/callback'],
  ARRAY['openid', 'email', 'profile'],
  true
);

SELECT code FROM authorization_codes ORDER BY created_at DESC LIMIT 1;

SELECT id FROM clients ORDER BY created_at DESC LIMIT 1;



UPDATE clients 
SET secret = '$2b$10$GeeEx8izG.8rA8aJjJnCleuh2.Xe.Y28QLhb2kDV5h3QStpydDMHK'
WHERE id = 'c8e305b8-109a-46a8-b37f-ebca1f76c84e'

SELECT * FROM session;
