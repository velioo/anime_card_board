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

GRANT ALL ON users TO velioo;
GRANT ALL ON users_id_seq TO velioo;

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    return NEW;
END ;$$
  LANGUAGE plpgsql;

CREATE TRIGGER update_user_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TABLE "temp_codes" (
  "user_id" integer NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "hash" character varying(255) NOT NULL,
  "type" character varying(255) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("hash")
);

GRANT ALL ON temp_codes TO velioo;

CREATE TABLE "rooms" (
  "id" serial NOT NULL,
  "name" character varying(20) NOT NULL UNIQUE,
  "player1_id" integer NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE UNIQUE,
  "player2_id" integer REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

GRANT ALL ON rooms TO velioo;
GRANT ALL ON rooms_id_seq TO velioo;

CREATE TRIGGER update_room_timestamp BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TABLE "gameplay_statuses" (
  "id" integer NOT NULL,
  "name" TEXT NOT NULL,
  PRIMARY KEY (id)
);

GRANT ALL ON gameplay_statuses TO velioo;

INSERT INTO gameplay_statuses (id, name) VALUES (1, 'In progress'), (2, 'Finished');

CREATE TABLE "boards" (
  "id" serial NOT NULL,
  "board_matrix_json" text NOT NULL,
  "board_data_json" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO boards (id, board_matrix_json, board_data_json) VALUES (1,
'[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]',
'{"player1StartBoardIndex":0,"player2StartBoardIndex":23,"boardPath":[[4,0],[4,1],[4,2],[3,2],[3,3],[3,4],[4,4],[5,4],[5,5],[5,6],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[4,14],[4,15],[4,16],[4,17],[4,18],[4,19]]}');

GRANT ALL ON boards TO velioo;
GRANT ALL ON boards_id_seq TO velioo;

CREATE TABLE "games" (
  "id" serial NOT NULL,
  "room_id" integer UNIQUE,
  "player1_id" integer NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "player2_id" integer NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "data_json" text NOT NULL,
  "room_data_json" text NOT NULL,
  "status_id" integer NOT NULL REFERENCES gameplay_statuses(id) ON UPDATE CASCADE,
  "winning_player_id" integer REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "board_id" integer NOT NULL REFERENCES boards(id) ON UPDATE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finished_at" timestamp,
  PRIMARY KEY (id)
);

GRANT ALL ON games TO velioo;
GRANT ALL ON games_id_seq TO velioo;

CREATE table "card_rarities" (
  "id" integer NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

GRANT ALL ON card_rarities TO velioo;

CREATE table "cards" (
  "id" serial NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "image" text NOT NULL,
  "rarity" integer NOT NULL REFERENCES card_rarities(id),
  "effect_json" text NOT NULL,
  PRIMARY KEY (id)
);

GRANT ALL ON cards TO velioo;
GRANT ALL ON cards_id_seq TO velioo;

INSERT INTO card_rarities (id, name) VALUES (1, 'Common');
INSERT INTO card_rarities (id, name) VALUES (2, 'Rare');
INSERT INTO card_rarities (id, name) VALUES (3, 'Epic');

INSERT INTO cards (id, name, description, image, effect_json) VALUES (1, 'Misaka', 'Go 3 spaces forward', 'Misaka.jpg',
'{"moveSpacesForward":3,"instantEffect":true}');