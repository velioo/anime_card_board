CREATE TABLE "users" (
  "id" bigserial NOT NULL,
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
  "user_id" bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "hash" character varying(255) NOT NULL,
  "type" character varying(255) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("hash")
);

CREATE TABLE "rooms" (
  "id" bigserial NOT NULL,
  "name" character varying(20) NOT NULL UNIQUE,
  "player1_id" bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE UNIQUE,
  "player2_id" bigint REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TRIGGER update_room_timestamp BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
GRANT ALL ON users TO velioo;
GRANT ALL ON temp_codes TO velioo;
GRANT ALL ON rooms TO velioo;
GRANT ALL ON users_id_seq;

CREATE TABLE "gameplay_statuses" (
  "id" bigint NOT NULL,
  "name" TEXT NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO gameplay_statuses (id, name) VALUES (1, 'In progress'), (2, 'Finished');

CREATE TABLE "boards" (
  "id" bigserial NOT NULL,
  "board_matrix_json" text NOT NULL,
  "board_data_json" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO boards (id, board_matrix_json, board_data_json) VALUES (1,
'[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]',
'{"player1StartBoardIndex":0,"player2StartBoardIndex":23,"boardPath":[[4,0],[4,1],[4,2],[3,2],[3,3],[3,4],[4,4],[5,4],[5,5],[5,6],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[4,14],[4,15],[4,16],[4,17],[4,18],[4,19]]}');

GRANT ALL ON boards TO velioo;
GRANT ALL ON boards_id_seq TO velioo;

CREATE TABLE "games" (
  "id" bigserial NOT NULL,
  "room_id" bigint UNIQUE,
  "player1_id" bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "player2_id" bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "data_json" text NOT NULL,
  "room_data_json" text NOT NULL,
  "status_id" bigint NOT NULL REFERENCES gameplay_statuses(id) ON UPDATE CASCADE,
  "winning_player_id" bigint REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "board_id" bigint NOT NULL REFERENCES boards(id) ON UPDATE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finished_at" timestamp,
  PRIMARY KEY (id)
);

GRANT ALL ON gameplay_statuses TO velioo;
GRANT ALL ON games TO velioo;
GRANT ALL ON games_id_seq TO velioo;