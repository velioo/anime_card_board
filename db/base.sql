CREATE TABLE "users" (
  "id" serial NOT NULL,
  "username" character varying(255) NOT NULL,
  "password" text NOT NULL,
  "salt" text NOT NULL,
  "email" character varying(255) NOT NULL,
  "is_confirmed" boolean DEFAULT false NOT NULL,
  "settings_json" text DEFAULT '{}',
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
  "settings_json" TEXT NOT NULL DEFAULT '{}',
  "is_matchmade" boolean NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

GRANT ALL ON rooms TO velioo;
GRANT ALL ON rooms_id_seq TO velioo;

CREATE TABLE "matchmaking" (
  "id" serial NOT NULL,
  "user_id" integer NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE UNIQUE,
  "settings_json" TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (id)
);

GRANT ALL ON matchmaking TO velioo;
GRANT ALL ON matchmaking_id_seq TO velioo;

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
  "name" TEXT NOT NULL,
  "board_matrix_json" text NOT NULL,
  "board_data_json" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO boards (id, name, board_matrix_json, board_data_json) VALUES (1, 'Test Board',
'[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,1,2,0,7,0,1,12,1,14,1,9,8,1,6,1,4,1,2,1],[0,0,0,0,1,9,10,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]',
'{"player1StartBoardIndex":0,"player2StartBoardIndex":23,"boardPath":[[4,0],[4,1],[4,2],[3,2],[3,3],[3,4],[4,4],[5,4],[5,5],[5,6],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[4,14],[4,15],[4,16],[4,17],[4,18],[4,19]]}');
INSERT INTO boards (id, name, board_matrix_json, board_data_json) VALUES (2, 'The Snake',
'[[0,0,6,1,3,1,12,11,1,2,1,1,13,6,1,1,9,1,4,0],[12,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],[1,0,0,0,0,0,0,1,1,14,2,13,1,6,0,12,1,7,9,0],[10,4,5,1,1,2,0,5,0,0,0,0,0,1,1,1,0,0,0,0],[0,0,0,0,0,1,0,1,0,1,12,1,8,0,0,0,1,12,7,1],[5,1,11,6,1,10,0,7,9,1,0,0,1,5,10,0,8,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,9,0,1,5],[7,1,2,9,0,1,1,6,11,3,12,1,1,1,2,0,1,0,1,0],[0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0],[1,3,8,1,0,9,10,1,5,1,4,1,6,1,13,2,1,0,3,1]]',
'{"player1StartBoardIndex":0,"player2StartBoardIndex":109,"boardPath":[[9,0],[9,1],[9,2],[9,3],[8,3],[7,3],[7,2],[7,1],[7,0],[6,0],[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[4,5],[3,5],[3,4],[3,3],[3,2],[3,1],[3,0],[2,0],[1,0],[1,1],[1,2],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11],[0,12],[0,13],[0,14],[0,15],[0,16],[0,17],[0,18],[1,18],[2,18],[2,17],[2,16],[2,15],[3,15],[3,14],[3,13],[2,13],[2,12],[2,11],[2,10],[2,9],[2,8],[2,7],[3,7],[4,7],[5,7],[5,8],[5,9],[4,9],[4,10],[4,11],[4,12],[5,12],[5,13],[5,14],[6,14],[7,14],[7,13],[7,12],[7,11],[7,10],[7,9],[7,8],[7,7],[7,6],[7,5],[8,5],[9,5],[9,6],[9,7],[9,8],[9,9],[9,10],[9,11],[9,12],[9,13],[9,14],[9,15],[9,16],[8,16],[7,16],[6,16],[5,16],[4,16],[4,17],[4,18],[4,19],[5,19],[6,19],[6,18],[7,18],[8,18],[9,18],[9,19]]}');

GRANT ALL ON boards TO velioo;
GRANT ALL ON boards_id_seq TO velioo;

CREATE TABLE "games" (
  "id" serial NOT NULL,
  "room_id" integer UNIQUE,
  "player1_id" integer NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "player2_id" integer NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "data_json" text NOT NULL,
  "deck_json" text NOT NULL DEFAULT '[]',
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
  "id" text NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

GRANT ALL ON card_rarities TO velioo;

INSERT INTO card_rarities (id, name) VALUES ('common', 'Common');
INSERT INTO card_rarities (id, name) VALUES ('rare', 'Rare');
INSERT INTO card_rarities (id, name) VALUES ('epic', 'Epic');

CREATE table "cards" (
  "id" serial NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "image" text NOT NULL,
  "rarity_id" text NOT NULL REFERENCES card_rarities(id),
  "effect_json" text NOT NULL,
  "cost" integer NOT NULL,
  "attributes" text[] NOT NULL,
  PRIMARY KEY (id)
);

GRANT ALL ON cards TO velioo;
GRANT ALL ON cards_id_seq TO velioo;

INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (1, 'Misaka', 'Go 6 spaces forward.', 'Misaka.jpg', 'rare',
'{"effect": "moveSpacesForward", "effectValue": 6, "autoEffect":true, "continuous": false}', 3, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (2, 'Alice', 'Go up to 2 spaces forward.',
'Alice.jpg', 'common', '{"effect": "moveSpacesForwardUpTo", "effectValue": 2, "autoEffect": false, "continuous": false}', 2, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (3, 'Okabe', 'Move your opponent up to 2 spaces backward.',
'Okabe.png', 'common', '{"effect": "moveSpacesBackwardsUpToEnemy", "effectValue": 2, "autoEffect":false, "continuous": false}', 2, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (4, 'Kagura', 'Move your opponent 6 spaces backward.',
'Kagura.jpg', 'rare', '{"effect": "moveSpacesBackwardsEnemy", "effectValue": 6, "autoEffect":true, "continuous": false}', 3, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (5, 'Lucy', 'Move 1 space forward or backward.',
'Lucy.png', 'common', '{"effect": "moveSpacesForwardOrBackwardUpTo", "effectValue": 1, "autoEffect":false, "continuous": false}', 1, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (6, 'Kakashi',
'Choose a special board space up to <span style="color:rgb(65, 105, 225); font-weight: 700;">|X|</span> spaces forward and apply its effect for yourself. The number of spaces you can choose up to increases by 4 every time you use this card (max 30). This card has 3 charges, each time you use it, 1 charge is consumed. Each use of this effect consumes 1 additional Energy compared to the previous use (max 5).',
'Kakashi.jpg', 'epic',
'{"autoEffect":false, "continuous": true, "effectChargesCount": 3, "maxUsesPerTurn": 1, "continuousEffectType": "onClick", "energyPerUse": 1, "energyPerUseMax": 5, "effect": "copySpecialSpacesUpTo", "effectValue": 4, "effectValueMax": 30, "energyPerUseIncrement": "+1", "energyPerUseIncrementCondition": "totalUsedCharges", "energyPerUseIncrementConditionFilter": "every1", "effectValueIncrement": "+4", "effectValueIncrementCondition": "totalUsedCharges", "effectValueIncrementConditionFilter": "every1"}', 2, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (7, 'Lelouch',
'Move your opponent up to <span style="color:rgb(171, 33, 33); font-weight: 700;">|X|</span> spaces forward or backward. The number of spaces you can choose up to increases x2 every time you use this card (max 20). This card has 3 charges, each time you use it, 1 charge is consumed. Each use of this effect consumes 1 additional Energy compared to the previous use (max 5).',
'Lelouch.webp', 'epic',
'{"autoEffect":false, "continuous": true, "effectChargesCount": 3, "maxUsesPerTurn": 1, "continuousEffectType": "onClick", "energyPerUse": 1, "energyPerUseMax": 5, "effect": "moveSpacesForwardOrBackwardUpToEnemy", "effectValue": 2, "effectValueMax": 20, "energyPerUseIncrement": "+1", "energyPerUseIncrementCondition": "totalUsedCharges", "energyPerUseIncrementConditionFilter": "every1", "effectValueIncrement": "x2", "effectValueIncrementCondition": "totalUsedCharges", "effectValueIncrementConditionFilter": "every1"}', 2, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (8, 'Edward', 'Choose an empty board space up to 10 spaces forward and create a Tier 1 special board space on its location.',
'Edward.png', 'common', '{"effect": "createSpecialBoardSpaceForwardTier1", "effectValue": 10, "autoEffect": false, "continuous": false}', 1, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (9, 'Saber', 'Go up to <span style="color:rgb(65, 105, 225); font-weight: 700;">|X|</span> spaces forward. For every 5 cards in your graveyard you can go up to 1 more space forward (max 10), and for every 10 cards in your graveyard the energy cost increases by 1 (max 5).',
'Saber.gif', 'rare', '{"effect": "moveSpacesForwardUpTo", "effectValue": 1, "autoEffect": false, "continuous": false, "effectValueIncrement": "+1", "effectValueIncrementCondition": "cardsInYourGraveyard", "effectValueIncrementConditionFilter": "every5", "effectValueMax": 10, "costIncrement": "+1", "costIncrementCondition": "cardsInYourGraveyard", "costIncrementConditionFilter": "every10", "costMax": 5}', 1, '{field}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (10, 'Kazuma', 'Take a card from your opponent''s hand.', 'Kazuma.jpg', 'common',
'{"effect": "drawCardFromEnemyHand", "effectValue": 1, "autoEffect":true, "continuous": false}', 2, '{cards}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (11, 'Kurumi', 'Choose a card from your opponent''s field and destroy it.', 'Kurumi.gif', 'rare',
'{"effect": "destroyCardFromEnemyField", "effectValue": 1, "autoEffect":true, "continuous": false}', 3, '{cards}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (12, 'Yugi', 'Draw 2 cards from the deck and your opponent draws 1.', 'Yugi.jpg', 'common',
'{"effect": "drawCardFromDeckYouEnemy", "effectValue": 2, "effectValueEnemy": 1, "autoEffect":true, "continuous": false}', 1, '{cards}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (13, 'Ononoki', 'While this card is active, your opponent cannot target other cards on your field for destruction. This card has 3 charges, 1 charge is consumed on every SP. If this card is still on your field on your 3-rd SP, draw 1 card.', 'Ononoki.png', 'common',
'{"effect": "taunt", "effectExpire": "drawCardFromDeckYou", "chargeConsumedPhase": "standby", "effectValueExpire": 1, "effectChargesCount": 3,"continuousEffectType": "passive", "autoEffect":true, "continuous": true}', 3, '{cards}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (14, 'Sōma', 'While this card is on your field, your Energy regeneration is increased by 2. This card has 3 charges, 1 charge is consumed on every MP (not including the MP this card was summoned).', 'Souma.png', 'rare',
'{"effect": "energyRegen", "effectChargesCount": 3, "effectValue": 2, "chargeConsumedPhase": "main", "continuousEffectType": "passive", "autoEffect":true, "continuous": true}', 1, '{energy}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes) VALUES (15, 'Aladdin', 'For this turn only, all the effects of the special board spaces you step on are nullified.', 'Aladdin.jpg', 'common',
'{"effect": "nullifyAllSpecialBoardSpaces", "effectChargesCount": 1, "chargeConsumedPhase": "end", "continuousEffectType": "passive", "autoEffect":true, "continuous": true}', 2, '{field}');