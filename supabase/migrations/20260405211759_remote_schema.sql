
  create table "public"."Application" (
    "company" text not null,
    "role" text not null,
    "platform" text not null,
    "status" text not null,
    "appliedDate" timestamp(3) without time zone not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "Id" text not null,
    "userId" text not null
      );


alter table "public"."Application" enable row level security;


  create table "public"."_prisma_migrations" (
    "id" character varying(36) not null,
    "checksum" character varying(64) not null,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) not null,
    "logs" text,
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone not null default now(),
    "applied_steps_count" integer not null default 0
      );


alter table "public"."_prisma_migrations" enable row level security;


  create table "public"."applications" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "company" character varying(255) not null,
    "role" character varying(255) not null,
    "platform" character varying(255) not null,
    "status" character varying(50) not null default 'applied'::character varying,
    "applied_date" date not null,
    "salary" character varying(100),
    "location" character varying(255),
    "notes" text,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
      );


alter table "public"."applications" enable row level security;


  create table "public"."email_preferences" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "daily_digest_enabled" boolean default true,
    "digest_time" time without time zone default '09:00:00'::time without time zone,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
      );


alter table "public"."email_preferences" enable row level security;


  create table "public"."follow_ups" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "application_id" uuid not null,
    "type" character varying(50) not null default 'email'::character varying,
    "scheduled_date" date not null,
    "completed" boolean default false,
    "completed_at" timestamp with time zone,
    "notes" text,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP
      );


alter table "public"."follow_ups" enable row level security;

CREATE UNIQUE INDEX "Application_pkey" ON public."Application" USING btree ("Id");

CREATE UNIQUE INDEX _prisma_migrations_pkey ON public._prisma_migrations USING btree (id);

CREATE UNIQUE INDEX applications_pkey ON public.applications USING btree (id);

CREATE UNIQUE INDEX email_preferences_pkey ON public.email_preferences USING btree (id);

CREATE UNIQUE INDEX email_preferences_user_id_key ON public.email_preferences USING btree (user_id);

CREATE UNIQUE INDEX follow_ups_pkey ON public.follow_ups USING btree (id);

CREATE INDEX idx_applications_applied_date ON public.applications USING btree (applied_date DESC);

CREATE INDEX idx_applications_status ON public.applications USING btree (status);

CREATE INDEX idx_applications_user_id ON public.applications USING btree (user_id);

CREATE INDEX idx_follow_ups_application_id ON public.follow_ups USING btree (application_id);

CREATE INDEX idx_follow_ups_scheduled_date ON public.follow_ups USING btree (scheduled_date);

CREATE INDEX idx_follow_ups_user_id ON public.follow_ups USING btree (user_id);

alter table "public"."Application" add constraint "Application_pkey" PRIMARY KEY using index "Application_pkey";

alter table "public"."_prisma_migrations" add constraint "_prisma_migrations_pkey" PRIMARY KEY using index "_prisma_migrations_pkey";

alter table "public"."applications" add constraint "applications_pkey" PRIMARY KEY using index "applications_pkey";

alter table "public"."email_preferences" add constraint "email_preferences_pkey" PRIMARY KEY using index "email_preferences_pkey";

alter table "public"."follow_ups" add constraint "follow_ups_pkey" PRIMARY KEY using index "follow_ups_pkey";

alter table "public"."applications" add constraint "applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."applications" validate constraint "applications_user_id_fkey";

alter table "public"."email_preferences" add constraint "email_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."email_preferences" validate constraint "email_preferences_user_id_fkey";

alter table "public"."email_preferences" add constraint "email_preferences_user_id_key" UNIQUE using index "email_preferences_user_id_key";

alter table "public"."follow_ups" add constraint "follow_ups_application_id_fkey" FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE not valid;

alter table "public"."follow_ups" validate constraint "follow_ups_application_id_fkey";

alter table "public"."follow_ups" add constraint "follow_ups_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."follow_ups" validate constraint "follow_ups_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."Application" to "anon";

grant insert on table "public"."Application" to "anon";

grant references on table "public"."Application" to "anon";

grant select on table "public"."Application" to "anon";

grant trigger on table "public"."Application" to "anon";

grant truncate on table "public"."Application" to "anon";

grant update on table "public"."Application" to "anon";

grant delete on table "public"."Application" to "authenticated";

grant insert on table "public"."Application" to "authenticated";

grant references on table "public"."Application" to "authenticated";

grant select on table "public"."Application" to "authenticated";

grant trigger on table "public"."Application" to "authenticated";

grant truncate on table "public"."Application" to "authenticated";

grant update on table "public"."Application" to "authenticated";

grant delete on table "public"."Application" to "service_role";

grant insert on table "public"."Application" to "service_role";

grant references on table "public"."Application" to "service_role";

grant select on table "public"."Application" to "service_role";

grant trigger on table "public"."Application" to "service_role";

grant truncate on table "public"."Application" to "service_role";

grant update on table "public"."Application" to "service_role";

grant delete on table "public"."_prisma_migrations" to "anon";

grant insert on table "public"."_prisma_migrations" to "anon";

grant references on table "public"."_prisma_migrations" to "anon";

grant select on table "public"."_prisma_migrations" to "anon";

grant trigger on table "public"."_prisma_migrations" to "anon";

grant truncate on table "public"."_prisma_migrations" to "anon";

grant update on table "public"."_prisma_migrations" to "anon";

grant delete on table "public"."_prisma_migrations" to "authenticated";

grant insert on table "public"."_prisma_migrations" to "authenticated";

grant references on table "public"."_prisma_migrations" to "authenticated";

grant select on table "public"."_prisma_migrations" to "authenticated";

grant trigger on table "public"."_prisma_migrations" to "authenticated";

grant truncate on table "public"."_prisma_migrations" to "authenticated";

grant update on table "public"."_prisma_migrations" to "authenticated";

grant delete on table "public"."_prisma_migrations" to "service_role";

grant insert on table "public"."_prisma_migrations" to "service_role";

grant references on table "public"."_prisma_migrations" to "service_role";

grant select on table "public"."_prisma_migrations" to "service_role";

grant trigger on table "public"."_prisma_migrations" to "service_role";

grant truncate on table "public"."_prisma_migrations" to "service_role";

grant update on table "public"."_prisma_migrations" to "service_role";

grant delete on table "public"."applications" to "authenticated";

grant insert on table "public"."applications" to "authenticated";

grant select on table "public"."applications" to "authenticated";

grant update on table "public"."applications" to "authenticated";

grant delete on table "public"."applications" to "service_role";

grant insert on table "public"."applications" to "service_role";

grant references on table "public"."applications" to "service_role";

grant select on table "public"."applications" to "service_role";

grant trigger on table "public"."applications" to "service_role";

grant truncate on table "public"."applications" to "service_role";

grant update on table "public"."applications" to "service_role";

grant insert on table "public"."email_preferences" to "authenticated";

grant select on table "public"."email_preferences" to "authenticated";

grant update on table "public"."email_preferences" to "authenticated";

grant delete on table "public"."email_preferences" to "service_role";

grant insert on table "public"."email_preferences" to "service_role";

grant references on table "public"."email_preferences" to "service_role";

grant select on table "public"."email_preferences" to "service_role";

grant trigger on table "public"."email_preferences" to "service_role";

grant truncate on table "public"."email_preferences" to "service_role";

grant update on table "public"."email_preferences" to "service_role";

grant delete on table "public"."follow_ups" to "authenticated";

grant insert on table "public"."follow_ups" to "authenticated";

grant select on table "public"."follow_ups" to "authenticated";

grant update on table "public"."follow_ups" to "authenticated";

grant delete on table "public"."follow_ups" to "service_role";

grant insert on table "public"."follow_ups" to "service_role";

grant references on table "public"."follow_ups" to "service_role";

grant select on table "public"."follow_ups" to "service_role";

grant trigger on table "public"."follow_ups" to "service_role";

grant truncate on table "public"."follow_ups" to "service_role";

grant update on table "public"."follow_ups" to "service_role";


  create policy "Users can delete their own applications"
  on "public"."applications"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own applications"
  on "public"."applications"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own applications"
  on "public"."applications"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own applications"
  on "public"."applications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own email preferences"
  on "public"."email_preferences"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own email preferences"
  on "public"."email_preferences"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own email preferences"
  on "public"."email_preferences"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can delete their own follow_ups"
  on "public"."follow_ups"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own follow_ups"
  on "public"."follow_ups"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own follow_ups"
  on "public"."follow_ups"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own follow_ups"
  on "public"."follow_ups"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON public.email_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


