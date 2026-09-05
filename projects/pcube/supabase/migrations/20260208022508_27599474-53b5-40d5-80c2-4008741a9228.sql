-- pg_cron 확장 활성화 (extensions 스키마)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- pg_net 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;