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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const decks_1 = __importDefault(require("../models/decks"));
const games_1 = __importDefault(require("../models/games"));
const users_1 = __importDefault(require("../models/users"));
// Récuperation de l'historique de mes parties
const history = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const userId = decodedToken.id;
    const allGames = yield games_1.default.aggregate([
        {
            $match: {
                "config.userId": userId
            }
        },
        {
            $sort: { date: -1 }
        },
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
});
// Compte le nombre de parties
const count = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const countGames = yield games_1.default.aggregate([
        {
            $count: "count"
        }
    ]);
    res.status(200).json(((_a = countGames === null || countGames === void 0 ? void 0 : countGames[0]) === null || _a === void 0 ? void 0 : _a.count) || 0);
});
// Récuperation des parties
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allGames = yield games_1.default.find().sort({ date: -1 }).limit(100);
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
    let winners = [];
    let decksWinners = [];
    const gameObject = req.body;
    const { type, config: configGame, victoire } = gameObject;
    const tricheryRolVictory = (role) => {
        if (victoire === 'Seigneur')
            return role === victoire || role === 'Gardien';
        return role === victoire;
    };
    const usersPlayer = [...new Set(configGame.map((conf) => conf.userId))];
    const deckPlayer = [...new Set(configGame.map((conf) => conf.deckId))];
    if (type === 'each') {
        winners = [victoire];
        decksWinners = configGame.filter((conf) => conf.userId === victoire).map((winner) => winner.deckId);
    }
    else if (type === 'team') {
        winners = configGame.filter((conf) => conf.team === victoire).map((winner) => winner.userId);
        decksWinners = configGame.filter((conf) => conf.team === victoire).map((winner) => winner.deckId);
    }
    else if (type === 'treachery') {
        winners = configGame.filter((conf) => tricheryRolVictory(conf.role)).map((winner) => winner.userId);
        decksWinners = configGame.filter((conf) => tricheryRolVictory(conf.role)).map((winner) => winner.deckId);
    }
    yield games_1.default.create(Object.assign({}, gameObject))
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield users_1.default.updateMany({ _id: { $in: [...new Set(usersPlayer)] } }, { $inc: { partiesJouees: 1 } });
        yield users_1.default.updateMany({ _id: { $in: [...new Set(winners)] } }, { $inc: { victoires: 1 } });
        yield decks_1.default.updateMany({ _id: { $in: [...new Set(deckPlayer)] } }, { $inc: { parties: 1 } });
        yield decks_1.default.updateMany({ _id: { $in: [...new Set(decksWinners)] } }, { $inc: { victoires: 1 } });
        res.status(200).json({ config: configGame, victoire });
    }))
        .catch(error => res.status(400).json({ error }));
});
exports.default = { getAll, add, history, count };
//# sourceMappingURL=game.js.map