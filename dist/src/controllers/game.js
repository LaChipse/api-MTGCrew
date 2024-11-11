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
const mongodb_1 = require("mongodb");
const config_1 = require("../config/config");
const date_fns_1 = require("date-fns");
const decks_1 = __importDefault(require("../models/decks"));
const games_1 = __importDefault(require("../models/games"));
const users_1 = __importDefault(require("../models/users"));
// Récuperation de mes decks
const getMyGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const userId = decodedToken.id;
    const tes = new mongodb_1.ObjectId(userId);
    const mineDecks = yield decks_1.default.find({ userId: tes });
    res.status(200).json(mineDecks);
});
// Récuperation des parties
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allGames = yield games_1.default.find();
    const response = allGames.map((game) => ({
        id: game._id,
    }));
    res.status(200).json(response);
});
// Ajout d'une partie
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let winners = [];
    const gameObject = req.body;
    const { date, type, config, victoire, typeVictoire } = gameObject;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config.secret_key);
    const formatDate = date ? (0, date_fns_1.format)(date, 'dd/MM/yyyy') : '';
    const usersPlayer = [...new Set(config.map((conf) => conf.userId))];
    if (type === 'each') {
        winners = [victoire];
    }
    else if (type === 'team') {
        winners = config.filter((conf) => conf.team === victoire).map((winner) => winner.userId);
    }
    else if (type === 'treachery') {
        winners = config.filter((conf) => conf.role === victoire).map((winner) => winner.userId);
    }
    console.log('WINNERS', winners);
    console.log('usersPlayer', usersPlayer);
    const userId = decodedToken.id;
    yield games_1.default.create(Object.assign(Object.assign({}, gameObject), { date: formatDate }))
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield users_1.default.updateMany({ _id: { $in: usersPlayer } }, { $inc: { partiesJouees: 1 } });
        yield users_1.default.updateMany({ _id: { $in: [...new Set(winners)] } }, { $inc: { victoires: 1 } });
        res.status(200).json('partie ajoutée');
    }))
        .catch(error => res.status(400).json({ error }));
});
exports.default = { getAll, add };
//# sourceMappingURL=game.js.map