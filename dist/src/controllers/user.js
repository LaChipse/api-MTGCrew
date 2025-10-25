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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongodb_1 = require("mongodb");
const users_1 = __importDefault(require("../models/users"));
const config_1 = require("../config/config");
const games_1 = __importDefault(require("../models/games"));
// Récupération d'un utilisateur
const getOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    try {
        const user = yield users_1.default.findById(userId);
        if (!user)
            res.status(401).json('Requête non authentifiée !');
        if (user) {
            const userObject = user.toObject();
            const { password, _id } = userObject, restUser = __rest(userObject, ["password", "_id"]);
            res.status(200).json(Object.assign(Object.assign({}, restUser), { id: _id }));
        }
    }
    catch (error) {
        res.status(400).json('Erreur lors de la récupération de l\'utilisateur');
    }
});
// Récupération des utilisateurs
const all = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isStandard = req.params.type === 'true';
    try {
        const allUsers = yield users_1.default.find().sort({ prenom: 1 });
        const response = yield Promise.all(allUsers.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const lastHundredGames = yield games_1.default
                .find({ 'config.userId': user._id.toString(), isStandard })
                .sort({ date: -1 })
                .limit(100);
            const wins = countWins(lastHundredGames, user._id.toString(), isStandard);
            ;
            const formatLastHundredGames = () => {
                if (lastHundredGames.length > 0) {
                    return lastHundredGames.length === 100
                        ? wins
                        : Math.round((wins / lastHundredGames.length) * 100);
                }
                return 0;
            };
            return {
                id: user._id.toString(),
                fullName: `${user.prenom} ${user.nom.charAt(0)}.`,
                nbrDecks: user.nbrDecks,
                partiesJouees: user.partiesJouees,
                victoires: user.victoires,
                hundredGameWins: formatLastHundredGames(),
            };
        })));
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(400).json('Erreur lors de la récupération des utilisateurs');
    }
});
const countWins = (games, userId, isStandard) => {
    return games.reduce((acc, game) => {
        if (isStandard) {
            return acc + (game.victoire === userId ? 1 : 0);
        }
        else {
            const userConfig = Array.isArray(game.config)
                ? game.config.find((c) => c.userId === userId)
                : null;
            if (!userConfig)
                return acc;
            return acc + (game.victoire === userConfig.role ? 1 : 0);
        }
    }, 0);
};
//Récupere des utilisateurs et de leurs decks
const getUsersWithDecks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield users_1.default.aggregate([
            { $addFields: { userId: { $toString: "$_id" } } },
            { $lookup: {
                    from: "decks",
                    localField: "userId",
                    foreignField: "userId",
                    as: "decks"
                } },
            { $project: {
                    _id: 1,
                    decks: 1
                } }
        ]);
        const response = allUsers.map((user) => ({
            id: user._id,
            decks: user.decks
        }));
        res.status(200).json(response);
    }
    catch (error) {
        res.status(400).json('Erreur lors des decks et utilisateurs');
    }
});
// Mise à jour utilisateur
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    const { nom, prenom, password } = req.body;
    try {
        if (password) {
            bcrypt_1.default.hash(password, 10)
                .then((hash) => __awaiter(void 0, void 0, void 0, function* () {
                yield users_1.default.updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
                    $set: {
                        password: hash
                    }
                });
            }))
                .catch(error => res.status(500).json({ error }));
        }
        yield users_1.default.updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
            $set: {
                nom,
                prenom,
            }
        });
        res.status(200).json({ nom, prenom });
    }
    catch (error) {
        res.status(400).json('Erreur lors de la modification de l\'utilisateur');
    }
});
exports.default = { getOne, update, all, getUsersWithDecks };
//# sourceMappingURL=user.js.map