CREATE TABLE "users" (
  "id" serial NOT NULL,
  "username" character varying(255) NOT NULL,
  "password" text NOT NULL,
  "salt" text NOT NULL,
  "email" character varying(255) NOT NULL,
  "is_confirmed" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    return NEW;
END ;$$
  LANGUAGE plpgsql;

CREATE TRIGGER update_user_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TABLE "temp_codes" (
  "user_id" int NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "hash" character varying(255) NOT NULL,
  "type" character varying(255) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("hash")
);

CREATE TABLE "rooms" (
  "id" serial NOT NULL,
  "name" character varying(20) NOT NULL UNIQUE,
  "player1_id" int NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE UNIQUE,
  "player2_id" int REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TRIGGER update_room_timestamp BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
GRANT ALL ON users TO velioo;
GRANT ALL ON temp_codes TO velioo;
GRANT ALL ON rooms TO velioo;
GRANT ALL ON users_id_seq;