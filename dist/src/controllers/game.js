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
const games_1 = __importDefault(require("../models/games"));
const journal_1 = __importDefault(require("../models/journal"));
const AuthService_1 = __importDefault(require("../services/AuthService"));
const GameService_1 = __importDefault(require("../services/GameService"));
// Récuperation de l'historique de mes parties
const history = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameService = new GameService_1.default;
    const authService = new AuthService_1.default;
    const userId = yield authService.isValidId(req);
    if (!userId)
        return res.status(422).json('Données reçues invalides');
    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    try {
        const { query, sort } = gameService.getQuery(isStandard, req.query);
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
            typeVictoire: game.typeVictoire,
            isRanked: game.isRanked
        }));
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json('Erreur lors de la récupération des parties');
    }
});
// Compte le nombre de parties
const historyCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authService = new AuthService_1.default;
    const gameService = new GameService_1.default;
    const userId = yield authService.isValidId(req);
    if (!userId)
        return res.status(422).json('Données reçues invalides');
    const isStandard = req.params.type === 'true';
    try {
        const { query } = gameService.getQuery(isStandard, req.query);
        const countGames = yield games_1.default.aggregate([
            { $match: Object.assign({ "config.userId": userId }, query) },
            { $count: "count" }
        ]);
        return res.status(200).json(((_a = countGames === null || countGames === void 0 ? void 0 : countGames[0]) === null || _a === void 0 ? void 0 : _a.count) || 0);
    }
    catch (error) {
        return res.status(500).json('Erreur lors du decompte des parties');
    }
});
// Compte le nombre de parties
const count = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const gameService = new GameService_1.default;
    const isStandard = req.params.type === 'true';
    try {
        const { query } = gameService.getQuery(isStandard, req.query);
        const countGames = yield games_1.default.aggregate([
            { $match: query },
            { $count: "count" }
        ]);
        return res.status(200).json(((_a = countGames === null || countGames === void 0 ? void 0 : countGames[0]) === null || _a === void 0 ? void 0 : _a.count) || 0);
    }
    catch (error) {
        return res.status(500).json('Erreur lors du decompte des parties');
    }
});
// Récuperation des parties
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameService = new GameService_1.default;
    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    try {
        const { query, sort } = gameService.getQuery(isStandard, req.query);
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
            typeVictoire: game.typeVictoire,
            isRanked: game.isRanked
        }));
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json('Erreur lors de la récupération des parties');
    }
});
// Ajout d'une partie
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new AuthService_1.default;
    const gameService = new GameService_1.default;
    const gameObject = req.body;
    const { config: configParties, victoire, type, isStandard, isRanked } = gameObject;
    const userId = yield authService.isValidId(req);
    if (!userId)
        return res.status(422).json('Données reçues invalides');
    // const deckService = new DeckService
    try {
        yield games_1.default.create(Object.assign({}, gameObject));
        yield gameService.updateUserAndDeck(configParties, type, victoire, isStandard, isRanked, 1);
        // await deckService.updateRank()
        yield journal_1.default.create({
            idUser: userId,
            action: 'Ajout partie',
            body: Object.assign({}, gameObject),
            date: new Date(),
        });
        return res.status(201).json({ config: configParties, victoire });
    }
    catch (error) {
        yield journal_1.default.create({
            idUser: userId,
            action: 'Ajout partie',
            body: { error },
            date: new Date(),
        });
        return res.status(500).json('Erreur lors de la création de la partie');
    }
});
// Suppression d'une partie
const hardDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new AuthService_1.default;
    const gameService = new GameService_1.default;
    const userId = yield authService.isValidId(req);
    if (!userId)
        return res.status(422).json('Données reçues invalides');
    const gameId = req.query.id;
    if (!mongodb_1.ObjectId.isValid(gameId))
        return res.status(422).json('Données reçues invalides');
    try {
        const game = yield games_1.default.findById(gameId);
        if (!game)
            res.status(404).json('Partie introuvable');
        const { config, victoire, type, isStandard, isRanked } = game;
        yield games_1.default.deleteOne({ _id: new mongodb_1.ObjectId(gameId) });
        yield gameService.updateUserAndDeck(config, type, victoire, isStandard, isRanked, -1);
        yield journal_1.default.create({
            idUser: userId,
            action: 'Suppression partie',
            body: Object.assign({}, game),
            date: new Date(),
        });
        return res.status(200).json({ id: game._id, type, config, victoire, typeVictoire: game.typeVictoire, isStandard });
    }
    catch (error) {
        yield journal_1.default.create({
            idUser: userId,
            action: 'Suppression partie',
            body: { error },
            date: new Date(),
        });
        return res.status(500).json('Erreur lors de la suppression de la partie');
    }
});
exports.default = { getAll, add, history, count, historyCount, hardDelete };
//# sourceMappingURL=game.js.map