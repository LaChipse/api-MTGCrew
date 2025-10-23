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
const decks_1 = __importDefault(require("../models/decks"));
const games_1 = __importDefault(require("../models/games"));
const users_1 = __importDefault(require("../models/users"));
// Récuperation de l'historique de mes parties
const history = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    const { startDate, endDate, winnerId, victoryRole, typeOfVictory } = req.query;
    const query = {
        isStandard,
    };
    let sort = { date: -1 };
    query.date = {
        $gte: startDate ? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
    };
    if (victoryRole || winnerId) {
        query.victoire = winnerId ? winnerId : victoryRole;
    }
    if (typeOfVictory)
        query.typeVictoire = typeOfVictory;
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    try {
        const allGames = yield games_1.default.aggregate([
            {
                $match: Object.assign({ "config.userId": userId }, query)
            },
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
    const userId = decodedToken.id;
    const isStandard = req.params.type === 'true';
    const { startDate, endDate, winnerId, victoryRole, typeOfVictory } = req.query;
    const query = {
        isStandard,
    };
    query.date = {
        $gte: startDate ? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
    };
    if (victoryRole || winnerId) {
        query.victoire = winnerId ? winnerId : victoryRole;
    }
    if (typeOfVictory)
        query.typeVictoire = typeOfVictory;
    const countGames = yield games_1.default.aggregate([
        {
            $match: Object.assign({ "config.userId": userId }, query)
        },
        {
            $count: "count"
        }
    ]);
    res.status(200).json(((_a = countGames === null || countGames === void 0 ? void 0 : countGames[0]) === null || _a === void 0 ? void 0 : _a.count) || 0);
});
// Compte le nombre de parties
const count = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const isStandard = req.params.type === 'true';
    const { startDate, endDate, winnerId, victoryRole, typeOfVictory } = req.query;
    const query = {
        isStandard,
    };
    query.date = {
        $gte: startDate ? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
    };
    if (victoryRole || winnerId) {
        query.victoire = winnerId ? winnerId : victoryRole;
    }
    if (typeOfVictory)
        query.typeVictoire = typeOfVictory;
    const countGames = yield games_1.default.aggregate([
        {
            $match: query
        },
        {
            $count: "count"
        }
    ]);
    res.status(200).json(((_b = countGames === null || countGames === void 0 ? void 0 : countGames[0]) === null || _b === void 0 ? void 0 : _b.count) || 0);
});
// Récuperation des parties
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    const { startDate, endDate, winnerId, victoryRole, typeOfVictory } = req.query;
    const query = {
        isStandard,
    };
    query.date = {
        $gte: startDate ? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
    };
    if (victoryRole || winnerId) {
        query.victoire = winnerId ? winnerId : victoryRole;
    }
    if (typeOfVictory)
        query.typeVictoire = typeOfVictory;
    const allGames = yield games_1.default
        .find(query)
        .sort({ date: -1 })
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
});
// Ajout d'une partie
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let winnersSpecial = [];
    let winnersStandard = [];
    let decksWinnersSpecial = [];
    let decksWinnersStandard = [];
    const gameObject = req.body;
    const { type, config: configGame, victoire, isStandard } = gameObject;
    const tricheryRolVictory = (role) => {
        if (victoire === 'Seigneur')
            return role === victoire || role === 'Gardien';
        return role === victoire;
    };
    const usersPlayer = [...new Set(configGame.map((conf) => conf.userId))];
    const deckPlayer = [...new Set(configGame.map((conf) => conf.deckId))];
    if (isStandard) {
        if (type === 'each') {
            winnersStandard = [victoire];
            decksWinnersStandard = configGame.filter((conf) => conf.userId === victoire).map((winner) => winner.deckId);
        }
        else if (type === 'team') {
            winnersStandard = configGame.filter((conf) => conf.team === victoire).map((winner) => winner.userId);
            decksWinnersStandard = configGame.filter((conf) => conf.team === victoire).map((winner) => winner.deckId);
        }
        yield games_1.default.create(Object.assign({}, gameObject))
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield users_1.default.updateMany({ _id: { $in: [...new Set(usersPlayer)] } }, { $inc: { 'partiesJouees.standard': 1 } });
            yield users_1.default.updateMany({ _id: { $in: [...new Set(winnersStandard)] } }, { $inc: { 'victoires.standard': 1 } });
            yield decks_1.default.updateMany({ _id: { $in: [...new Set(deckPlayer)] } }, { $inc: { 'parties.standard': 1 } });
            yield decks_1.default.updateMany({ _id: { $in: [...new Set(decksWinnersStandard)] } }, { $inc: { 'victoires.standard': 1 } });
            res.status(200).json({ config: configGame, victoire });
        }))
            .catch(error => res.status(400).json({ error }));
    }
    else {
        if (type === 'treachery') {
            winnersSpecial = configGame.filter((conf) => tricheryRolVictory(conf.role)).map((winner) => winner.userId);
            decksWinnersSpecial = configGame.filter((conf) => tricheryRolVictory(conf.role)).map((winner) => winner.deckId);
        }
        else if (type === 'archenemy') {
            winnersSpecial = configGame.filter((conf) => conf.role === victoire).map((winner) => winner.userId);
            decksWinnersSpecial = configGame.filter((conf) => conf.role === victoire).map((winner) => winner.deckId);
        }
        yield games_1.default.create(Object.assign({}, gameObject))
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield users_1.default.updateMany({ _id: { $in: [...new Set(usersPlayer)] } }, { $inc: { 'partiesJouees.special': 1 } });
            yield users_1.default.updateMany({ _id: { $in: [...new Set(winnersSpecial)] } }, { $inc: { 'victoires.special': 1 } });
            yield decks_1.default.updateMany({ _id: { $in: [...new Set(deckPlayer)] } }, { $inc: { 'parties.special': 1 } });
            yield decks_1.default.updateMany({ _id: { $in: [...new Set(decksWinnersSpecial)] } }, { $inc: { 'victoires.special': 1 } });
            res.status(200).json({ config: configGame, victoire });
        }))
            .catch(error => res.status(400).json({ error }));
    }
});
exports.default = { getAll, add, history, count, historyCount };
//# sourceMappingURL=game.js.map