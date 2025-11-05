"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const games_1 = __importDefault(require("../models/games"));
const GameService_1 = __importDefault(require("../services/GameService"));
// Récuperation de l'historique de mes parties
const history = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const gameService = new GameService_1.default;
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    const { query, sort } = gameService.getQuery(isStandard, req.query);
    try {
        const allGames = yield games_1.default.aggregate([
            { $match: Object.assign({ "config.userId": userId }, query) },
            { $sort: sort },
            { $skip: 10 * (page - 1) },
            { $limit: 10 }
        ]);
        const response = allGames.map((game) => ({
            id: game._id,
            date: game.date,
            type: game.type,
            config: game.config,
            victoire: game.victoire,
            typeVictoire: game.typeVictoire
        }));
        res.status(200).json(response);
    }
    catch (error) {
        res.status(400).json('Erreur lors de la récupération des parties');
    }
});
// Compte le nombre de parties
const historyCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const gameService = new GameService_1.default;
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    const isStandard = req.params.type === 'true';
    const { query } = gameService.getQuery(isStandard, req.query);
    try {
        const countGames = yield games_1.default.aggregate([
            { $match: Object.assign({ "config.userId": userId }, query) },
            { $count: "count" }
        ]);
        res.status(200).json(((_a = countGames === null || countGames === void 0 ? void 0 : countGames[0]) === null || _a === void 0 ? void 0 : _a.count) || 0);
    }
    catch (error) {
        res.status(400).json('Erreur lors du decompte des parties');
    }
});
// Compte le nombre de parties
const count = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const gameService = new GameService_1.default;
    const isStandard = req.params.type === 'true';
    const { query } = gameService.getQuery(isStandard, req.query);
    try {
        const countGames = yield games_1.default.aggregate([
            { $match: query },
            { $count: "count" }
        ]);
        res.status(200).json(((_a = countGames === null || countGames === void 0 ? void 0 : countGames[0]) === null || _a === void 0 ? void 0 : _a.count) || 0);
    }
    catch (error) {
        res.status(400).json('Erreur lors du decompte des parties');
    }
});
// Récuperation des parties
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameService = new GameService_1.default;
    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    const { query, sort } = gameService.getQuery(isStandard, req.query);
    try {
        const allGames = yield games_1.default
            .find(query)
            .sort(sort)
            .skip(20 * (page - 1))
            .limit(20);
        const response = allGames.map((game) => ({
            id: game._id,
            date: game.date,
            type: game.type,
            config: game.config,
            victoire: game.victoire,
            typeVictoire: game.typeVictoire
        }));
        res.status(200).json(response);
    }
    catch (error) {
        res.status(400).json('Erreur lors de la récupération des parties');
    }
});
// Ajout d'une partie
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameObject = req.body;
    const { config, victoire, type, isStandard } = gameObject;
    const gameService = new GameService_1.default;
    try {
        yield games_1.default.create(Object.assign({}, gameObject));
        yield gameService.updateUserAndDeck(config, type, victoire, isStandard, 1);
        res.status(200).json({ config, victoire });
    }
    catch (error) {
        res.status(400).json('Erreur lors de la création de la partie');
    }
});
// Suppression d'une partie
const hardDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.query.id;
    if (!mongodb_1.ObjectId.isValid(gameId))
        throw new Error('gameId invalide');
    const gameService = new GameService_1.default;
    try {
        const game = yield games_1.default.findById(gameId);
        if (!game)
            res.status(404).json('Partie introuvable');
        const { config, victoire, type, isStandard } = game;
        yield games_1.default.deleteOne({ _id: new mongodb_1.ObjectId(gameId) });
        yield gameService.updateUserAndDeck(config, type, victoire, isStandard, -1);
        res.status(200).json({ id: game._id, type, config, victoire, typeVictoire: game.typeVictoire, isStandard });
    }
    catch (error) {
        res.status(400).json('Erreur lors de la suppression de la partie');
    }
});
exports.default = { getAll, add, history, count, historyCount, hardDelete };
//# sourceMappingURL=game.js.map