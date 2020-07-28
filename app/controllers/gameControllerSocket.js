const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');
const gameCore = require('../socket/gameCore.js');

const {
  ROOT,
  SERVICE_EMAIL_PROVIDER,
  SERVICE_EMAIL,
  EMAIL_PASS,
  TURN_PHASES,
  CARD_RARITIES,
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

module.exports = {
  startGame: async (ctx, next) => {
    logger.info('startGame gameController');
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
          timerSeconds: 300,
          nextPhase: TURN_PHASES.DRAW,
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
          playerIdDiscardedCard: null,
          cardDiscarded: null,
          playerIdFinishCard: null,
          cardFinish: null,
          playerIdWinGame: null,
          playersState: {
            [ctx.roomData.player1Id]: {
              name: ctx.roomData.player1Name,
              currBoardIndex: boardDataPlayers.player1StartBoardIndex,
              lastBoardIndex: boardDataPlayers.player1StartBoardIndex,
              cardsInHand: 0,
              maxCardsInHand: 6,
              cardsToDiscard: 0,
              cardsToDraw: 5,
              cardsSummonConstraints: {
                cardsCanSummonAny: false,
                cardsCanSummonCommon: true,
                cardsCanSummonRare: true,
                cardsCanSummonEpic: true,
              },
              cardsSummonedThisTurnCount: {
                common: 0,
                rare: 0,
                epic: 0,
              },
              cardsInHandArr: [],
              cardsOnFieldArr: [],
              maxCardsOnField: 5,
              canRollDiceBoardInRollPhase: true,
              canRollDiceBoardCount: 0,
              rollAgain: false,
              moveBackwardsOnNextRoll: null,
              moveBackwards: null,
              cardsInGraveyard: [],
              energyPoints: 0,
              maxEnergyPoints: 5,
            },
            [ctx.roomData.player2Id]: {
              name: ctx.roomData.player2Name,
              currBoardIndex: boardDataPlayers.player2StartBoardIndex,
              lastBoardIndex: boardDataPlayers.player2StartBoardIndex,
              cardsInHand: 0,
              maxCardsInHand: 6,
              cardsToDiscard: 0,
              cardsToDraw: 5,
              cardsSummonConstraints: {
                cardsCanSummonAny: false,
                cardsCanSummonCommon: true,
                cardsCanSummonRare: true,
                cardsCanSummonEpic: true,
              },
              cardsSummonedThisTurnCount: {
                common: 0,
                rare: 0,
                epic: 0,
              },
              cardsInHandArr: [],
              cardsOnFieldArr: [],
              maxCardsOnField: 5,
              canRollDiceBoardInRollPhase: true,
              canRollDiceBoardCount: 0,
              rollAgain: false,
              moveBackwardsOnNextRoll: null,
              moveBackwards: null,
              cardsInGraveyard: [],
              energyPoints: 0,
              maxEnergyPoints: 5,
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

      await gameCore.activePlayerHook(ctx);

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/start_game', message: 'There was a problem starting the game. Retrying...' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to start game: %o', err);
    }
  },
  drawCard: async (ctx, next) => {
    logger.info('drawCard gameController');
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

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(playerState.cardsToDraw > 0);

      playerState.cardsToDraw--;
      playerState.cardsInHand++;
      gameState.playerIdDrawnCard = ctx.session.userData.userId;

      await gameCore.drawCardHook(ctx);
      await gameCore.activePlayerHook(ctx);

      playerState.cardsInHandArr.push(ctx.cardDrawn);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/draw_card', message: 'There was a problem while drawing card.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to draw card: %o', err);
    }
  },
  drawPhase: async (ctx, next) => {
    logger.info('drawPhase gameController');
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

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(gameState.currPlayerId == ctx.session.userData.userId);
      assert(gameState.nextPhase == TURN_PHASES.DRAW);

      gameState.nextPhase = TURN_PHASES.STANDBY;
      var currTime = new Date();
      currTime = Math.round(currTime.getTime() / 1000);
      gameState.startTurnTime = currTime;
      gameState.turnDeadlineTime = currTime + ctx.gameplayData.gameState.timerSeconds;

      await gameCore.drawPhaseHook(ctx);
      await gameCore.activePlayerHook(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/draw_phase', message: 'There was a problem with draw phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on draw phase: %o', err);
    }
  },
  standByPhase: async (ctx, next) => {
    logger.info('standByPhase gameController');
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

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(gameState.currPlayerId == ctx.session.userData.userId);
      assert(gameState.nextPhase == TURN_PHASES.STANDBY);

      gameState.nextPhase = TURN_PHASES.MAIN;

      await gameCore.standyPhaseHook(ctx);
      await gameCore.activePlayerHook(ctx);

      // Do something... -> card effects

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/standby_phase', message: 'There was a problem with standby phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on standby phase: %o', err);
    }
  },
  mainPhase: async (ctx, next) => {
    logger.info('mainPhase gameController');
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

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(gameState.currPlayerId == ctx.session.userData.userId);
      assert(gameState.nextPhase == TURN_PHASES.MAIN);

      gameState.nextPhase = TURN_PHASES.ROLL;

      await gameCore.mainPhaseHook(ctx);
      await gameCore.activePlayerHook(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/main_phase', message: 'There was a problem with main phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on main phase: %o', err);
    }
  },
  summonCard: async (ctx, next) => {
    logger.info('summonCard gameController');
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

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(playerState.cardsOnFieldArr.length
        < playerState.maxCardsOnField);
      assert(playerState.cardsSummonConstraints.cardsCanSummonAny);

      let cardStatus = await utils.selectRowById({ table: 'cards', field: 'id', queryArg: ctx.data.cardId });
      var cardFromDb = {
        cardId: cardStatus.rows[0].id,
        cardName: cardStatus.rows[0].name,
        cardText: cardStatus.rows[0].description,
        cardImg: cardStatus.rows[0].image,
        cardRarity: cardStatus.rows[0].rarity_id,
        cardEffect: JSON.parse(cardStatus.rows[0].effect_json),
        cardCost: cardStatus.rows[0].cost,
      };

      assert(playerState.energyPoints >= cardFromDb.cardCost);
      playerState.energyPoints -= cardFromDb.cardCost;

      switch(cardFromDb.cardRarity) {
        case CARD_RARITIES.COMMON:
          assert(playerState.cardsSummonConstraints.cardsCanSummonCommon);
          playerState.cardsSummonedThisTurnCount.common++;
          break;
        case CARD_RARITIES.RARE:
          assert(playerState.cardsSummonConstraints.cardsCanSummonRare);
          playerState.cardsSummonedThisTurnCount.rare++;
          break;
        case CARD_RARITIES.EPIC:
          assert(playerState.cardsSummonConstraints.cardsCanSummonEpic);
          playerState.cardsSummonedThisTurnCount.epic++;
          break;
        default:
          assert(0, "Invalid card rarity: " + cardRarity);
          break;
      }

      let cardSelected = playerState.cardsInHandArr[ctx.data.cardIdx];
      assert(cardSelected && (cardSelected.cardId == ctx.data.cardId) && (cardFromDb.cardId == cardSelected.cardId));

      gameState.cardSummonedIdxInPlayerHand = ctx.data.cardIdx;
      gameState.cardSummoned = cardFromDb;
      playerState.cardsInHandArr.splice(ctx.data.cardIdx, 1);
      playerState.cardsInHand--;
      gameState.playerIdSummonedCard = ctx.session.userData.userId;
      playerState.cardsOnFieldArr.push(cardFromDb);

      await gameCore.summonCardHook(ctx);
      await gameCore.activePlayerHook(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/summon_card', message: 'There was a problem while summoning card.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to summon card: %o', err);
    }
  },
  rollPhase: async (ctx, next) => {
    logger.info('rollPhase gameController');
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

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(gameState.currPlayerId == ctx.session.userData.userId);
      assert(gameState.nextPhase == TURN_PHASES.ROLL);

      gameState.nextPhase = TURN_PHASES.END;

      await gameCore.rollPhaseHook(ctx);
      await gameCore.activePlayerHook(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/roll_phase', message: 'There was a problem with roll phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on roll phase: %o', err);
    }
  },
  rollDiceBoard: async (ctx, next) => {
    logger.info('rollDiceBoard gameController');
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

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(playerState.canRollDiceBoardCount > 0);

      if (gameState.nextPhase == TURN_PHASES.ROLL) {
        assert(playerState.canRollDiceBoardInRollPhase);
      }

      playerState.canRollDiceBoardCount--;
      gameState.rollDiceBoard.playerIdRollDice = ctx.session.userData.userId;

      await gameCore.rollDiceBoardHook(ctx);
      await gameCore.activePlayerHook(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/roll_dice_board', message: 'There was a problem with rolling the board dice.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on board dice roll: %o', err);
    }
  },
  endPhase: async (ctx, next) => {
    logger.info('endPhase gameController');
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

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(gameState.currPlayerId == ctx.session.userData.userId);
      assert(gameState.nextPhase == TURN_PHASES.END);

      await gameCore.endPhaseHook(ctx);
      await gameCore.activePlayerHook(ctx);

      gameState.nextPhase = TURN_PHASES.DRAW;
      gameState.currPlayerId = ctx.session.userData.userId == ctx.roomData.player1Id
        ? ctx.roomData.player2Id : ctx.roomData.player1Id;

      resetTurn(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/end_phase', message: 'There was a problem with end phase.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed on end phase: %o', err);
    }
  },
  discardCard: async (ctx, next) => {
    logger.info('discardCard gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);
      ctx.data.cardId = parseInt(ctx.data.cardId);
      ctx.data.cardIdx = parseInt(ctx.data.cardIdx);

      const isSchemaValid = ajv.validate(SCHEMAS.DISCARD_CARD, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert(playerState.cardsToDiscard > 0);
      playerState.cardsToDiscard--;

      let cardSelected = playerState.cardsInHandArr[ctx.data.cardIdx];

      assert(cardSelected && cardSelected.cardId == ctx.data.cardId);

      gameState.cardDiscarded = cardSelected;
      playerState.cardsInHandArr.splice(ctx.data.cardIdx, 1);
      playerState.cardsInHand--;
      gameState.playerIdDiscardedCard = ctx.session.userData.userId;

      playerState.cardsInGraveyard.push(cardSelected);

      await gameCore.discardCardHook(ctx);
      await gameCore.activePlayerHook(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/discard_card', message: 'There was a problem while discarding card.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to discard card: %o', err);
    }
  },
  finishCardEffect: async (ctx, next) => {
    logger.info('finishCardEffect gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);
      ctx.data.cardId = parseInt(ctx.data.cardId);
      assert(ctx.data.finishData);

      const isSchemaValid = ajv.validate(SCHEMAS.FINISH_CARD, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      let cardFinish;
      let cardIdx;

      for (let i = 0; i < playerState.cardsOnFieldArr.length; i++) {
        if (playerState.cardsOnFieldArr[i].cardId == ctx.data.cardId) {
          cardFinish = playerState.cardsOnFieldArr[i];
          cardIdx = i;
        }
      }

      assert(cardFinish);
      assert(cardIdx >= 0);
      assert((cardFinish.cardId == ctx.data.cardId) && (!cardFinish.cardEffect.isFinished));

      cardFinish.cardEffect.isFinished = true;

      gameState.cardFinish = cardFinish;
      playerState.cardsOnFieldArr.splice(cardIdx, 1);
      gameState.playerIdFinishCard = ctx.session.userData.userId;

      await gameCore.cardFinishHook(ctx);
      await gameCore.activePlayerHook(ctx);

      queryStatus = await utils.updateRowById({ table: 'games', field: 'data_json', queryArg: JSON.stringify(ctx.gameplayData),
        field2: 'room_id', queryArg2: ctx.data.roomId });

      gameState.playersState[ctx.roomData.player1Id].cardsInHandArr = null;
      gameState.playersState[ctx.roomData.player2Id].cardsInHandArr = null;

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/finish_card', message: 'There was a problem while finishing card effect.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to finish card: %o', err);
    }
  },
  winGameFormally: async (ctx, next) => {
    logger.info('winGameFormally gameController');
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

      logger.info('queryStatus: ', queryStatus);

      // assert(queryStatus.rows[0].id);

      await pg.pool.query('COMMIT');
    } catch(err) {
      ctx.errors.push({ dataPath: '/win_game_formally', message: 'There was a problem finishing the game. Please try again later.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to win game formally: %o', err);
    }
  },
  winGameEnemyTimeout: async (ctx, next) => {
    logger.info('winGameEnemyTimeout gameController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      ctx.data.roomId = parseInt(ctx.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.WIN_GAME_ENEMY_TIMEOUT, ctx.data);

      assert(isSchemaValid);
      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

      assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
        || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

      ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
      ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);

      let gameState = ctx.gameplayData.gameState;
      let playerState = gameState.playersState[ctx.session.userData.userId];

      assert((ctx.session.userData.userId != gameState.currPlayerId)
        || (ctx.session.userData.userId != gameState.activePlayerId));
      assert(ctx.session.userData.userId != gameState.activePlayerId);
      assert(ctx.session.userData.userId == ctx.roomData.player1Id || ctx.session.userData.userId == ctx.roomData.player2Id);

      var currTime = new Date();
      currTime = Math.round(currTime.getTime() / 1000);
      assert(currTime > gameState.turnDeadlineTime);

      queryStatus = await pg.pool.query(`

        UPDATE games
        SET status_id = 2,
          winning_player_id = $1,
          finished_at = now()
        WHERE room_id = $2
          AND status_id = 1
        RETURNING id

      `, [ ctx.session.userData.userId, ctx.data.roomId ]);

      logger.info('queryStatus: ', queryStatus);

      await pg.pool.query('COMMIT');
    } catch(err) {
      ctx.errors.push({ dataPath: '/win_game_timeout', message: 'There was a problem finishing the game. Please try again later.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to win game timeout: %o', err);
    }
  }
};

let resetTurn = (ctx) => {
  let gameState = ctx.gameplayData.gameState;

  for (let playerId in gameState.playersState) {
    gameState.playersState[playerId].cardsSummonConstraints.energyPoints = 0;
    gameState.playersState[playerId].rollAgain = false;
    gameState.playersState[playerId].moveBackwardsOnNextRoll = null;
    gameState.playersState[playerId].moveBackwards = null;
    gameState.playersState[playerId].cardsSummonedThisTurnCount.common = 0;
    gameState.playersState[playerId].cardsSummonedThisTurnCount.rare = 0;
    gameState.playersState[playerId].cardsSummonedThisTurnCount.epic = 0;
  }
  gameState.playerIdDrawnCard = null;
  gameState.playerIdSummonedCard = null;
  gameState.playerIdDiscardedCard = null;
  gameState.playerIdFinishCard = null;
  gameState.cardSummoned = null;
  gameState.cardSummonedIdxInPlayerHand = null;
  gameState.rollDiceBoard = {
    playerIdRollDice: null,
    rollDiceValue: null,
  };
  gameState.rollDiceCard = {
    playerIdRollDice: null,
    rollDiceValue: null,
    cardId: null,
  };
  gameState.cardDiscarded = null;
  gameState.cardFinish = null;
};