CREATE TABLE "users" (
  "id" serial NOT NULL,
  "username" character varying(255) NOT NULL,
  "password" text NOT NULL,
  "salt" text NOT NULL,
  "email" character varying(255) NOT NULL,
  "is_confirmed" boolean DEFAULT false NOT NULL,
  "settings_json" text DEFAULT '{}',
  "level" integer NOT NULL DEFAULT 1,
  "current_level_xp" integer NOT NULL DEFAULT 0,
  "max_level_xp" integer NOT NULL DEFAULT 100,
  "wins_count" integer NOT NULL DEFAULT 0,
  "loses_count" integer NOT NULL DEFAULT 0,
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
  "sounds_json" text NOT NULL DEFAULT '{}',
  PRIMARY KEY (id)
);

GRANT ALL ON cards TO velioo;
GRANT ALL ON cards_id_seq TO velioo;

DELETE FROM cards;
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (1, 'Misaka', 'Go 6 spaces forward.', 'Misaka.jpg', 'rare',
'{"effect": "moveSpacesForward", "effectValue": 6, "autoEffect":true, "continuous": false}', 3, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (2, 'Alice', 'Go up to 2 spaces forward.',
'Alice.jpg', 'common', '{"effect": "moveSpacesForwardUpTo", "effectValue": 2, "autoEffect": false, "continuous": false}', 2, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (3, 'Okabe', 'Move your opponent up to 2 spaces backward.',
'Okabe.png', 'common', '{"effect": "moveSpacesBackwardsUpToEnemy", "effectValue": 2, "autoEffect":false, "continuous": false}', 2, '{field}', '{"activateEffects": ["Okabe.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (4, 'Kagura', 'Move your opponent 6 spaces backward.',
'Kagura.jpg', 'rare', '{"effect": "moveSpacesBackwardsEnemy", "effectValue": 6, "autoEffect":true, "continuous": false}', 3, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (5, 'Lucy', 'Move 1 space forward or backward.',
'Lucy.png', 'common', '{"effect": "moveSpacesForwardOrBackwardUpTo", "effectValue": 1, "autoEffect":false, "continuous": false}', 1, '{field}', '{"activateEffects": ["Lucy.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (6, 'Kakashi',
'Choose a special board space up to <span style="color:rgb(65, 105, 225); font-weight: 700;">|X|</span> spaces forward and apply its effect for yourself. The number of spaces you can choose up to increases by 4 every time you use this card (max 30). Each activation of this card consumes 1 additional Energy compared to the previous use (max 5), you may be returned some of the Energy back depending on the chosen special board space''s position - the further it is from you, the less Energy will be returned, for each 4 board spaces, 1 less Energy will be returned.',
'Kakashi.jpg', 'epic',
'{"autoEffect":false, "continuous": true, "effectChargesCount": 3, "maxUsesPerTurn": 1, "continuousEffectType": "onClick", "energyPerUse": 1, "energyPerUseMax": 5, "effect": "copySpecialSpacesUpTo", "effectValue": 4, "effectValueMax": 30, "energyPerUseIncrement": "+1", "energyPerUseIncrementCondition": "totalUsedCharges", "energyPerUseIncrementConditionFilter": "every1", "effectValueIncrement": "+4", "effectValueIncrementCondition": "totalUsedCharges", "effectValueIncrementConditionFilter": "every1", "energyReturnedPerLowerTierUsed": 1}', 2, '{field}', '{"activateEffects": ["Kakashi.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (7, 'Lelouch',
'Move your opponent up to <span style="color:rgb(171, 33, 33); font-weight: 700;">|X|</span> spaces forward or backward. The number of spaces you can choose up to increases x2 every time you use this card (max 20). Each activation of this card consumes 1 additional Energy compared to the previous use (max 5), you may be returned some of the Energy back depending on the chosen special board space''s position - the further it is from your opponent, the less Energy will be returned, for each x2 board spaces, 1 less Energy will be returned.',
'Lelouch.webp', 'epic',
'{"autoEffect":false, "continuous": true, "effectChargesCount": 3, "maxUsesPerTurn": 1, "continuousEffectType": "onClick", "energyPerUse": 1, "energyPerUseMax": 5, "effect": "moveSpacesForwardOrBackwardUpToEnemy", "effectValue": 2, "effectValueMax": 20, "energyPerUseIncrement": "+1", "energyPerUseIncrementCondition": "totalUsedCharges", "energyPerUseIncrementConditionFilter": "every1", "effectValueIncrement": "x2", "effectValueIncrementCondition": "totalUsedCharges", "effectValueIncrementConditionFilter": "every1", "energyReturnedPerLowerTierUsed": 1}', 2, '{field}', '{"activateEffects": ["Lelouch.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (8, 'Edward', 'Choose an empty board space up to 10 spaces forward and create a Tier 1 special board space on its location.',
'Edward.png', 'common', '{"effect": "createSpecialBoardSpaceForwardTier1", "effectValue": 10, "autoEffect": false, "continuous": false}', 1, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (9, 'Mysterious Heroine X Alter', 'Go up to <span style="color:rgb(65, 105, 225); font-weight: 700;">|X|</span> spaces forward. For every 5 cards in your graveyard you can go up to 1 more space forward (max 10), and for every 10 cards in your graveyard the energy cost increases by 1 (max 5).',
'Heroine-X-Alter.gif', 'rare', '{"effect": "moveSpacesForwardUpTo", "effectValue": 1, "autoEffect": false, "continuous": false, "effectValueIncrement": "+1", "effectValueIncrementCondition": "cardsInYourGraveyard", "effectValueIncrementConditionFilter": "every5", "effectValueMax": 10, "costIncrement": "+1", "costIncrementCondition": "cardsInYourGraveyard", "costIncrementConditionFilter": "every10", "costMax": 5}', 1, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (10, 'Kazuma', 'Take a card from your opponent''s hand.', 'Kazuma.jpg', 'common',
'{"effect": "drawCardFromEnemyHand", "effectValue": 1, "autoEffect":true, "continuous": false}', 2, '{cards}', '{"activateEffects": ["Kazuma.mp3", "Kazuma-2.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (11, 'Kurumi', 'Choose a card from your opponent''s field and destroy it.', 'Kurumi.gif', 'rare',
'{"effect": "destroyCardFromEnemyField", "effectValue": 1, "autoEffect":true, "continuous": false}', 3, '{cards}', '{"activateEffects":["Kurumi.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (12, 'Yugi', 'Draw 2 cards from the deck and your opponent draws 1.', 'Yugi.jpg', 'common',
'{"effect": "drawCardFromDeckYouEnemy", "effectValue": 2, "effectValueEnemy": 1, "autoEffect":false, "continuous": false}', 1, '{cards}', '{"activateEffects": ["Yugi.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (13, 'Ononoki', 'While this card is active, your opponent cannot target other cards on your field for destruction or decrease their charges. When this card expires (not destroyed), draw 1 card.', 'Ononoki.png', 'common',
'{"effect": "taunt", "effectExpire": "drawCardFromDeckYou", "chargeConsumedPhase": "standby", "effectValueExpire": 1, "effectChargesCount": 3, "continuousEffectType": "passive", "autoEffect":true, "continuous": true}', 2, '{cards}', '{"activateEffects": ["Ononoki.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (14, 'Sōma', 'While this card is on your field, your Energy regeneration is increased by 2.', 'Souma.png', 'rare',
'{"effect": "energyRegen", "effectChargesCount": 3, "effectValue": 2, "chargeConsumedPhase": "main", "continuousEffectType": "passive", "autoEffect":true, "continuous": true}', 1, '{energy}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (15, 'Aladdin', 'Until your next SP, all negative special board space''s effects won''t be applied to you (excludes random special board spaces).', 'Aladdin.jpg', 'common',
'{"effect": "nullifyAllNegativeSpecialBoardSpaces", "effectChargesCount": 1, "chargeConsumedPhase": "standby", "continuousEffectType": "passive", "autoEffect":true, "continuous": true}', 2, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (16, 'Tobirama', 'Take a card from your Graveyard to your hand, then shuffle your hand.', 'Tobirama.png', 'common',
'{"effect": "takeCardFromYourGraveyard", "effectValue": 1, "autoEffect":false, "continuous": false}', 2, '{cards}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (17, 'Violet', 'Summon this card on your field. When this card expires (not destroyed), increase your max Energy points by 2.', 'Violet.jpg', 'common',
'{"effect": "dummy", "effectChargesCount": 3, "effectExpire": "increaseMaxEnergy", "effectValueExpire": 2, "chargeConsumedPhase": "standby", "continuousEffectType": "passive", "autoEffect":true, "continuous": true}', 3, '{energy}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (18, 'Hayasaka', 'Roll the die. Go that many spaces forward and your opponent goes that many spaces backward.', 'Hayasaka.jpg', 'rare',
'{"effect": "moveSpacesForwardMoveSpacesBackwardEnemyX", "effectValue": 0, "effectValueIncrement": "x1", "effectValueDependentOn": "diceRoll", "autoEffect":false, "continuous": false}', 3, '{field}', '{"activateEffects": ["Hayasaka.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (19, 'Shiroe', 'Draw 3 cards from the deck, then discard 2.', 'Shiroe.jpg', 'common',
'{"effect": "drawCardFromDeckYouDiscardCardYou", "effectValue1": 3, "effectValue2": 2, "autoEffect":true, "continuous": false}', 2, '{cards}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (20, 'Ainz', 'While this card is on your field your opponent cannot summon field attribute cards. When this card expires (not destroyed), your opponent must discard 1 card from his hand.', 'Ainz.jpg', 'epic',
'{"effect": "nullifyCardsFieldSummon", "effectExpire": "discardCardEnemy", "effectValueExpire": 1, "chargeConsumedPhase": "main", "effectChargesCount": 3, "continuousEffectType": "passive", "autoEffect":true, "continuous": true}', 5, '{field, cards}', '{"activateEffects": ["Ainz.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (21, 'Ryūko', 'Destroy 1 special board space up to 10 spaces forward. If the board spaces''s Tier is 1 or 2, you will be returned either 2 or 1 Energy back respectively.', 'Ryuko.gif', 'rare',
'{"effect": "destroySpecialBoardSpaceForward", "effectValue": 10, "energyReturnedTier1": 2, "energyReturnedTier2": 1, "autoEffect": false, "continuous": false}', 3, '{field}', '{"activateEffects": ["Ryuko.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (22, 'Shiro', 'Go to the closest special board space forward or backward (excluding the board space you''re already on).', 'Shiro.gif', 'rare',
'{"effect": "moveSpacesClosestBoardSpaceSpecialYou", "autoEffect": false, "continuous": false}', 2, '{field}', '{"activateEffects": ["Shiro.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (23, 'Todoroki', 'Move your opponent to the closest special board space forward or backward (excluding the board space he''s already on).', 'Todoroki.gif', 'rare',
'{"effect": "moveSpacesClosestBoardSpaceSpecialEnemy", "autoEffect": false, "continuous": false}', 2, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (24, 'Emilia', 'While this card is on your field, your opponent cannot draw cards during his Draw Phase.', 'Emilia.jpg', 'common',
'{"effect": "nullifyDrawPhaseEnemy", "effectChargesCount": 3, "chargeConsumedPhase": "standby", "continuousEffectType": "passive", "autoEffect": true, "continuous": true}', 4, '{cards}', '{"activateEffects": ["Emilia.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (25, 'Tamaki', 'Apply to yourself the effect of the current special board space you are on. You can chain this card when you step on a special board space but only in your turn.', 'Tamaki.jpg', 'common',
'{"effect": "reapplyCurrentSpecialBoardSpaceYou", "autoEffect": true, "continuous": false}', 2, '{field}', '{"activateEffects": ["Tamaki.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (26, 'Shinya', 'Apply to your opponent the effect of the current special board space he is on. You can chain this card when your opponent steps on a special board space but only in your turn.', 'Shinya.jpg', 'common',
'{"effect": "reapplyCurrentSpecialBoardSpaceEnemy", "autoEffect": true, "continuous": false}', 2, '{field}', '{"activateEffects": ["Shinya.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (27, 'Inori', 'While this card is on your field, roll the die 1 more time during your Roll Phase.', 'Inori.jpg', 'common',
'{"effect": "rollDiceRollPhase", "effectValue": 1, "effectChargesCount": 3, "chargeConsumedPhase": "roll", "continuousEffectType": "passive", "autoEffect": true, "continuous": true}', 4, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (28, 'Kamina', 'Choose a continuous card from your field and increase its charges by 1.', 'Kamina.jpg', 'common',
'{"effect": "increaseChargesContinousCard", "effectValue": 1, "allowedAttributes": ["field", "cards", "energy"], "autoEffect": false, "continuous": false}', 2, '{cards}', '{"activateEffects": ["Kamina.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (29, 'Ange', 'Roll the die 1 times backward and then 2 times forward.', 'Ange.jpg', 'common',
'{"effect": "rollDiceForwardBackward", "effectValue1": 1, "effectValue2": 2, "autoEffect": true, "continuous": false}', 2, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (30, 'Hei', 'Choose a continuous card from your or your opponent''s field and decrease its charges by <span style="color:rgb(171, 33, 33); font-weight: 700;">|X|</span>. The number of charges you can decrease increases by 1 every time you use this card (max 5). Each activation of this card consumes 1 additional Energy compared to the previous use (max 5), you may be returned some of the Energy back depending on the chosen card''s charges left - the more charges left, the less Energy will be returned, for each 1 charge left, 1 less Energy will be returned.', 'Hei.png', 'epic',
'{"autoEffect":false, "continuous": true, "effectChargesCount": 3, "maxUsesPerTurn": 1, "continuousEffectType": "onClick", "energyPerUse": 1, "effect": "decreaseChargesContinousCardAll", "allowedAttributes": ["field", "cards", "energy"], "effectValue": 1, "energyPerUseMax": 5,  "effectValueMax": 5, "energyPerUseIncrement": "+1", "energyPerUseIncrementCondition": "totalUsedCharges", "energyPerUseIncrementConditionFilter": "every1", "effectValueIncrement": "+1", "effectValueIncrementCondition": "totalUsedCharges", "effectValueIncrementConditionFilter": "every1", "energyReturnedPerLowerTierUsed": 1}', 3, '{cards}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (31, 'Zero Two', 'Roll the die. Go to the the N-th non-special board space forward, depending on the rolled value.', 'Zero-Two.jpg', 'rare',
'{"effect": "moveSpacesForwardNonSpecial", "effectValue1": 0, "effectValueIncrement": "x1", "effectValueDependentOn": "diceRoll", "autoEffect": false, "continuous": false}', 4, '{field}', '{"activateEffects": ["Zero-Two.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (32, 'Mio', 'Your opponent takes a card from your hand, then you take a card from his hand. (Your opponent must have at least 1 card in his hand and you must have at least 1 other card in yours)', 'Mio.jpg', 'common',
'{"effect": "drawCardFromEnemyYourHand", "effectValue": 1, "autoEffect": true, "continuous": false}', 0, '{cards}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (33, 'Ryuk', 'Discard 2 cards from your hand, then take 1 card from your Graveyard to your hand.', 'Ryuk.jpg', 'common',
'{"effect": "discardCardTakeCardFromYourGraveyard", "effectValue1": 2, "effectValue2": 1, "autoEffect": false, "continuous": false}', 0, '{cards}', '{"activateEffects": ["Ryuk.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (34, 'Yato', 'Gain 3 Energy points.', 'Yato.jpg', 'rare',
'{"effect": "energyGain", "effectValue": 3, "autoEffect": true, "continuous": false}', 0, '{energy}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (35, 'Kabuto', 'Take a card from your opponents''s Graveyard to your hand, then shuffle your hand.', 'Kabuto.jpg', 'common',
'{"effect": "takeCardFromEnemyGraveyard", "effectValue": 1, "autoEffect":false, "continuous": false}', 2, '{cards}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (36, 'Kyōko', 'Choose a card attribute and draw 1 card from the deck. If the card has the attribute that you chose, depending on the chosen attribute the following effect will be applied: ''Field'' -> Go 8 spaces forward; ''Cards'' -> Increase your max cards in hand by 1 and draw 1 more card; ''Energy'' -> Increase your max energy by 1 and gain 3 Energy points. If the card doesn''t have the attribute that you chose, depending on the chosen attribute the following effect will be applied: ''Field'' -> Go 4 spaces backward; ''Cards'' -> Discard 2 cards from your hand; ''Energy'' -> Decrease your current Energy points by 3', 'Kyoko.jpg', 'rare',
'{"effect": "chooseAttributeVariation1", "effectValue": 1, "effectValue1_MoveSpacesForward": 8, "effectValue1_MoveSpacesBackward": 4, "effectValue2_IncreaseMaxCardsInHand": 1, "effectValue2_DrawCardsFromDeck": 1, "effectValue2_DiscardCards": 2, "effectValue3_IncreaseMaxEnergy": 1, "effectValue3_EnergyGain": 3, "effectValue3_EnergyLose": 3, "autoEffect":false, "continuous": false}', 3, '{field, cards, energy}', '{"activateEffects": ["Kyoko-1.wav", "Kyoko-2.wav", "Kyoko-3.wav", "Kyoko-4.wav", "Kyoko-5.wav", "Kyoko-6.wav"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (37, 'Goblin Slayer', 'Destroy all negative special board spaces around you. The radius of the covered area depends on the Energy points you choose to spend on this card. For every 2 Energy points you spend the radius of the area increases by 1. You cannot activate this card if there are no special board spaces around you or if you don''t have enough Energy to destroy at least 1 special board space.', 'Goblin-Slayer.gif', 'rare',
'{"effect": "destroySpecialBoardSpacesAllRadius", "effectValue": 2, "autoEffect":false, "continuous": false}', 0, '{field}', '{"activateEffects": ["Goblin-Slayer.mp3", "Goblin-Slayer-2.mp3"]}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (38, 'Holo', 'Apply to yourself the effect of the current special board space your opponent is on. You can chain this card when your opponent steps on a special board space but only in your turn, if you do, also nullify the effect of the special board space for your opponent.', 'Holo.jpg', 'common',
'{"effect": "reapplyCurrentSpecialBoardSpaceEnemyYou", "effectValue": 1, "autoEffect":true, "continuous": false}', 2, '{field}', '{}');
INSERT INTO cards (id, name, description, image, rarity_id, effect_json, cost, attributes, sounds_json) VALUES (39, 'Nine', 'Apply to your opponent the effect of the current special board space you are on. You can chain this card when you step on a special board space but only in your turn, if you do, also nullify the effect of the special board space for yourself.', 'Nine.jpg', 'common',
'{"effect": "reapplyCurrentSpecialBoardSpaceYouEnemy", "effectValue": 1, "autoEffect":true, "continuous": false}', 2, '{field}', '{}');