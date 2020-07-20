const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');

const {
  ROOT,
  SERVICE_EMAIL_PROVIDER,
  SERVICE_EMAIL,
  EMAIL_PASS,
} = require('../constants/constants');
const SCHEMAS = require('../schemas/schemas');

const assert = require('assert');
const _ = require('lodash/lang');
const Validations = require('../helpers/validations');
const sha256 = require('js-sha256').sha256;
const Nodemailer = require('nodemailer');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, $data: true, jsonPointers: true });
const ajvErrors = require('ajv-errors')(ajv);

const turnPhases = {
    DRAW: 1,
    STANDBY: 2,
    MAIN: 3,
    ROLL: 4,
    END: 5,
};

const cardRarities = {
    COMMON: 1,
    RARE: 2,
    EPIC: 3,
};

module.exports = {
  startGame: async (ctx, next) => {
    console.log('startGame gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);
      ctx.data.player1Id = parseInt(ctx.data.player1Id);
      ctx.data.player2Id = parseInt(ctx.data.player2Id);

      const isSchemaValid = ajv.validate(SCHEMAS.START_GAME, ctx.data);

      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId
        && ctx.session.userData.userId == ctx.data.player1Id);

      let queryStatus = await pg.pool.query(`

        SELECT
          R.*, U1.username as player1_name, U2.username as player2_name
        FROM rooms as R
        JOIN users as U1 ON U1.id = R.player1_id
        LEFT JOIN users as U2 ON U2.id = R.player2_id
        WHERE R.id = $1

      `, [ ctx.data.roomId ]);

      assert(queryStatus.rows.length == 1);
      assert(queryStatus.rows[0].player1_id && queryStatus.rows[0].player1_id == ctx.data.player1Id);
      assert(queryStatus.rows[0].player2_id && queryStatus.rows[0].player2_id == ctx.data.player2Id);

      ctx.roomData = {
        id: queryStatus.rows[0].id,
        name: queryStatus.rows[0].name,
        player1Name: queryStatus.rows[0].player1_name,
        player2Name: queryStatus.rows[0].player2_name,
        player1Id: queryStatus.rows[0].player1_id,
        player2Id: queryStatus.rows[0].player2_id,
      };

      let queryStatusBoards = await pg.pool.query(`

        SELECT * FROM boards
        WHERE id = $1

      `, [ ctx.data.boardId || 1 ]);

      assert(queryStatusBoards.rows.length == 1);

      let boardDataPlayers = JSON.parse(queryStatusBoards.rows[0].board_data_json);

      ctx.gameplayData = {
        gameState: {
          currPlayerId: ctx.data.player1Id,
          roomId: ctx.roomData.id,
          boardData: {
            id: queryStatusBoards.rows[0].board_id,
            boardMatrix: JSON.parse(queryStatusBoards.rows[0].board_matrix_json),
            boardDataPlayers: boardDataPlayers,
          },
          timerSeconds: 180,
          nextPhase: turnPhases.DRAW,
          playerIdDrawnCard: null,
          playerIdSummonedCard: null,
          cardSummoned: null,
          cardSummonedIdxInPlayerHand: null,
          rollDiceBoard: {
            playerIdRollDice: null,
            rollDiceValue: null,
          },
          rollDiceCard: {
            playerIdRollDice: null,
            rollDiceValue: null,
            cardId: null,
          },
          playerIdWinGame: null,
          playersState: {
            [ctx.roomData.player1Id]: {
              name: ctx.roomData.player1Name,
              currBoardIndex: boardDataPlayers.player1StartBoardIndex,
              lastBoardIndex: boardDataPlayers.player1StartBoardIndex,
              cardsInHand: 0,
              cardsToDraw: 5,
              cardsSummonConstraints: {
                cardsCanSummonAny: true,
                cardsCanSummonCommon: true,
                cardsCanSummonRare: true,
                cardsCanSummonEpic: true,
                cardsCanSummonCommonCount: 0,
                cardsCanSummonRareCount: 0,
                cardsCanSummonEpicCount: 0,
              },
              cardsInHandArr: [],
              cardsOnFieldArr: [],
              maxCardsOnField: 5,
              canRollDiceBoardInRollPhase: true,
              canRollDiceBoardCount: 0,
            },
            [ctx.roomData.player2Id]: {
              name: ctx.roomData.player2Name,
              currBoardIndex: boardDataPlayers.player2StartBoardIndex,
              lastBoardIndex: boardDataPlayers.player2StartBoardIndex,
              cardsInHand: 0,
              cardsToDraw: 5,
              cardsSummonConstraints: {
                cardsCanSummonAny: true,
                cardsCanSummonCommon: true,
                cardsCanSummonRare: true,
                cardsCanSummonEpic: true,
                cardsCanSummonCommonCount: 0,
                cardsCanSummonRareCount: 0,
                cardsCanSummonEpicCount: 0,
              },
              cardsInHandArr: [],
              cardsOnFieldArr: [],
              maxCardsOnField: 5,
              canRollDiceBoardInRollPhase: true,
              canRollDiceBoardCount: 0,
            },
          },
        },
      };

      queryStatus = await pg.pool.query(`

        INSERT INTO games (room_id, player1_id, player2_id, data_json, room_data_json, status_id, board_id)
        VALUES ($1, $2, $3, $4, $5, 1, $6)
        RETURNING *

      `, [ ctx.data.roomId, ctx.data.player1Id, ctx.data.player2Id, JSON.stringify(ctx.gameplayData),
        JSON.stringify(ctx.roomData), queryStatusBoards.rows[0].id ]);

      assert(queryStatus.rows[0].id);

      ctx.gameplayData.gameState.gameId = queryStatus.rows[0].id;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/start_game', message: 'There was a problem starting the game. Retrying...' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to start game: %o', err);
    }
  },
  drawCard: async (ctx, next) => {
    console.log('drawCard gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.DRAW_CARD, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsToDraw > 0);

      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsToDraw--;
      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInHand++;
      ctx.gameplayData.gameState.playerIdDrawnCard = ctx.session.userData.userId;

      ctx.cardDrawn = {
        cardId: 6,
        cardName: "Misaka",
        cardText: "This is Misaka",
        cardImg: "Misaka.jpg",
        cardRarity: cardRarities.COMMON,
      };

      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInHandArr.push(ctx.cardDrawn);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/draw_card', message: 'There was a problem while drawing card.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to draw card: %o', err);
    }
  },
  drawPhase: async (ctx, next) => {
    console.log('drawPhase gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.DRAW_PHASE, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      assert(ctx.gameplayData.gameState.currPlayerId == ctx.session.userData.userId);
      assert(ctx.gameplayData.gameState.nextPhase == turnPhases.DRAW);

      ctx.gameplayData.gameState.nextPhase = turnPhases.STANDBY;
      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsToDraw++;

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/draw_phase', message: 'There was a problem with draw phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on draw phase: %o', err);
    }
  },
  standByPhase: async (ctx, next) => {
    console.log('standByPhase gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.STANDBY_PHASE, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      assert(ctx.gameplayData.gameState.currPlayerId == ctx.session.userData.userId);
      assert(ctx.gameplayData.gameState.nextPhase == turnPhases.STANDBY);

      ctx.gameplayData.gameState.nextPhase = turnPhases.MAIN_PHASE;

      // Do something... -> card effects

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/standby_phase', message: 'There was a problem with standby phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on standby phase: %o', err);
    }
  },
  mainPhase: async (ctx, next) => {
    console.log('mainPhase gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.MAIN_PHASE, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      assert(ctx.gameplayData.gameState.currPlayerId == ctx.session.userData.userId);
      assert(ctx.gameplayData.gameState.nextPhase == turnPhases.MAIN_PHASE);

      ctx.gameplayData.gameState.nextPhase = turnPhases.ROLL;
      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonCommonCount = 2;

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/main_phase', message: 'There was a problem with main phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on main phase: %o', err);
    }
  },
  summonCard: async (ctx, next) => {
    console.log('summonCard gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);
      ctx.data.cardId = parseInt(ctx.data.cardId);
      ctx.data.cardIdx = parseInt(ctx.data.cardIdx);

      const isSchemaValid = ajv.validate(SCHEMAS.SUMMON_CARD, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsOnFieldArr.length
        < ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].maxCardsOnField);
      assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonAny);

      // TODO: find card in db by cardId, next line is hardcoded !!!
      var cardRarity = cardRarities.COMMON;

      switch(cardRarity) {
        case cardRarities.COMMON:
          assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonCommon
            && ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonCommonCount > 0);
          ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonCommonCount--;
          break;
        case cardRarities.RARE:
          assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonRare
            && ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonRareCount > 0);
          ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonRareCount--;
          break;
        case cardRarities.EPIC:
          assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonEpic
            && ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonEpicCount > 0);
          ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonEpicCount--;
          break;
        default:
          assert(0, "Invalid card rarity: " + cardRarity);
          break;
      }

      let cardSelected = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInHandArr[ctx.data.cardIdx];

      assert(cardSelected && cardSelected.cardId == ctx.data.cardId);

      ctx.gameplayData.gameState.cardSummonedIdxInPlayerHand = ctx.data.cardIdx;
      ctx.gameplayData.gameState.cardSummoned = cardSelected;
      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInHandArr.splice(ctx.data.cardIdx, 1);
      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInHand--;
      ctx.gameplayData.gameState.playerIdSummonedCard = ctx.session.userData.userId;

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/summon_card', message: 'There was a problem while summoning card.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to summon card: %o', err);
    }
  },
  rollPhase: async (ctx, next) => {
    console.log('rollPhase gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.ROLL_PHASE, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      assert(ctx.gameplayData.gameState.currPlayerId == ctx.session.userData.userId);
      assert(ctx.gameplayData.gameState.nextPhase == turnPhases.ROLL);

      ctx.gameplayData.gameState.nextPhase = turnPhases.END;
      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount = 1;

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/roll_phase', message: 'There was a problem with roll phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on roll phase: %o', err);
    }
  },
  rollDiceBoard: async (ctx, next) => {
    console.log('rollDiceBoard gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.ROLL_PHASE, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      assert(ctx.gameplayData.gameState.currPlayerId == ctx.session.userData.userId);
      assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount > 0);

      if (ctx.gameplayData.gameState.nextPhase == turnPhases.ROLL) {
        assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardInRollPhase);
      }

      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount--;
      ctx.gameplayData.gameState.rollDiceBoard.rollDiceValue = utils.getRandomInt(1, 6);
      ctx.gameplayData.gameState.rollDiceBoard.playerIdRollDice = ctx.session.userData.userId;

      let boardPath = ctx.gameplayData.gameState.boardData.boardDataPlayers.boardPath;
      let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;
      let rollDiceValue = ctx.gameplayData.gameState.rollDiceBoard.rollDiceValue;

      ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].lastBoardIndex = currBoardIndex;

      if (ctx.roomData.player1Id == ctx.session.userData.userId && boardPath[currBoardIndex + rollDiceValue]) {
        ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex + rollDiceValue;
      } else if (ctx.roomData.player2Id == ctx.session.userData.userId && currBoardIndex - rollDiceValue >= 0) {
        ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex - rollDiceValue;
      }

      if (checkWin(ctx)) {
        ctx.gameplayData.gameState.playerIdWinGame = ctx.session.userData.userId;
        let success = await winGame(ctx);
        assert(success === true);
      }

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/roll_dice_board', message: 'There was a problem with rolling the board dice.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on board dice roll: %o', err);
    }
  },
  endPhase: async (ctx, next) => {
    console.log('endPhase gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.END_PHASE, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      assert(ctx.gameplayData.gameState.currPlayerId == ctx.session.userData.userId);
      assert(ctx.gameplayData.gameState.nextPhase == turnPhases.END);
      assert(ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount <= 0);

      ctx.gameplayData.gameState.nextPhase = turnPhases.DRAW;
      ctx.gameplayData.gameState.currPlayerId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
      resetTurn(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/end_phase', message: 'There was a problem with end phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on end phase: %o', err);
    }
  },
  winGameFormally: async (ctx, next) => {
    console.log('winGameFormally gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.WIN_GAME_FORMALLY, ctx.data);

      assert(isSchemaValid);
      assert(ctx.session.userData && ctx.session.userData.userId);

      let player2LeftTheRoom = false;

      let queryStatus = await pg.pool.query(`

        SELECT * FROM rooms
        WHERE id = $1

      `, [ ctx.data.roomId ]);

      if (queryStatus.rows.length > 0) {
        assert(queryStatus.rows.length == 1);
        assert(!queryStatus.rows[0].player2_id);
        player2LeftTheRoom = true;
      }

      queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      if (player2LeftTheRoom) {
        // player 2 left the room
        assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId);
      } else {
        // player 1 left the room
        assert(queryStatus.rows[0].player2_id == ctx.session.userData.userId);
      }

      queryStatus = await pg.pool.query(`

        UPDATE games
        SET status_id = 2,
          winning_player_id = $1,
          finished_at = now()
        WHERE room_id = $2
          AND status_id = 1
        RETURNING id

      `, [ ctx.session.userData.userId, ctx.data.roomId ]);

      console.log('queryStatus: ', queryStatus);

      assert(queryStatus.rows[0].id);

      await pg.pool.query('COMMIT');
    } catch(err) {
      ctx.errors.push({ dataPath: '/win_game_formally', message: 'There was a problem finishing the game. Please try again later.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to win game formally: %o', err);
    }
  }
};

let checkWin = (ctx) => {
  let boardDataPlayers = ctx.gameplayData.gameState.boardData.boardDataPlayers;
  let boardPath = boardDataPlayers.boardPath;
  let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;

  if (ctx.roomData.player1Id == ctx.session.userData.userId && currBoardIndex == boardDataPlayers.player2StartBoardIndex) {
    return true;
  } else if (ctx.roomData.player2Id == ctx.session.userData.userId && currBoardIndex == boardDataPlayers.player1StartBoardIndex) {
    return true;
  }

  return false;
};

let winGame = async (ctx) => {
  let queryStatus = await pg.pool.query(`

    UPDATE games
    SET status_id = 2,
      winning_player_id = $1,
      finished_at = now()
    WHERE room_id = $2
      AND status_id = 1
    RETURNING id

  `, [ ctx.session.userData.userId, ctx.roomData.id ]);

  assert(queryStatus.rows[0].id);

  return true;
};

let resetTurn = (ctx) => {
  ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsSummonConstraints.cardsCanSummonCommonCount = 0;
  ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsSummonConstraints.cardsCanSummonRareCount = 0;
  ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].cardsSummonConstraints.cardsCanSummonEpicCount = 0;
  ctx.gameplayData.gameState.playersState[ctx.roomData.player1Id].canRollDiceBoardCount = 0;
  ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsSummonConstraints.cardsCanSummonCommonCount = 0;
  ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsSummonConstraints.cardsCanSummonRareCount = 0;
  ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].cardsSummonConstraints.cardsCanSummonEpicCount = 0;
  ctx.gameplayData.gameState.playersState[ctx.roomData.player2Id].canRollDiceBoardCount = 0;
  ctx.gameplayData.gameState.playerIdDrawnCard = null;
  ctx.gameplayData.gameState.playerIdSummonedCard = null;
  ctx.gameplayData.gameState.cardSummoned = null;
  ctx.gameplayData.gameState.cardSummonedIdxInPlayerHand = null;
  ctx.gameplayData.gameState.rollDiceBoard = {
    playerIdRollDice: null,
    rollDiceValue: null,
  };
  ctx.gameplayData.gameState.rollDiceCard = {
    playerIdRollDice: null,
    rollDiceValue: null,
    cardId: null,
  };
};