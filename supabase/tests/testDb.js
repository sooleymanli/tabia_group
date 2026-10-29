import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'migrations')

// Minimal stand-ins for the Supabase pieces the migration relies on (auth, vault, roles and
// Supabase's default grants), so RLS and RPC rules can be tested without Docker.
const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;

  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

  create schema auth;
  create table auth.users (id uuid primary key, email text, is_anonymous boolean not null default false);
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;

  create schema extensions;
  grant usage on schema extensions to anon, authenticated;

  create schema vault;
  create table vault.secrets (
    id uuid primary key default gen_random_uuid(),
    name text unique,
    secret text not null,
    description text
  );
  create view vault.decrypted_secrets as
    select id, name, secret as decrypted_secret, description from vault.secrets;
  create function vault.create_secret(new_secret text, new_name text default null, new_description text default '')
    returns uuid language sql
    as $$ insert into vault.secrets (secret, name, description) values ($1, $2, $3) returning id $$;
`

export async function createTestDb() {
  const db = await PGlite.create({ extensions: { pgcrypto } })
  await db.exec(SUPABASE_STUBS)
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
  for (const file of files) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'))
  }
  return db
}

export async function createUser(db, { email = null, anonymous = true } = {}) {
  const { rows } = await db.query(
    'insert into auth.users (id, email, is_anonymous) values (gen_random_uuid(), $1, $2) returning id',
    [email, anonymous],
  )
  return rows[0].id
}

// Runs a query the way PostgREST would for a signed-in user (role + JWT subject), or as anon.
export async function asUser(db, userId, sql, params = []) {
  return db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [
      userId ?? '',
    ])
    await tx.exec(`set local role ${userId ? 'authenticated' : 'anon'}`)
    const result = await tx.query(sql, params)
    return result.rows
  })
}

export async function rpc(db, userId, fn, args = {}) {
  const names = Object.keys(args)
  const call = names.map((name, i) => `${name} => $${i + 1}`).join(', ')
  const rows = await asUser(
    db,
    userId,
    `select * from public.${fn}(${call})`,
    Object.values(args),
  )
  return rows
}
