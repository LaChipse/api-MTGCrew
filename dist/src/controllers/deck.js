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
const decks_1 = __importDefault(require("../models/decks"));
const mongodb_1 = require("mongodb");
const config_1 = require("../config/config");
const users_1 = __importDefault(require("../models/users"));
const ScryFall_1 = __importDefault(require("../services/scryfall/ScryFall"));
// Récuperation de mes decks
const getMine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    const objectUserId = new mongodb_1.ObjectId(userId);
    try {
        const mineDecks = yield decks_1.default.find({ userId: objectUserId }).sort({ nom: 1 });
        res.status(200).json(mineDecks);
    }
    catch (error) {
        res.status(400).json('Erreur lors de la récupération des decks');
    }
});
// Récuperation des decks d'un joueur
const getUserDeck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    const objectUserId = new mongodb_1.ObjectId(userId);
    try {
        const userDecks = yield decks_1.default.find({ userId: objectUserId }).sort({ nom: 1 });
        res.status(200).json(userDecks);
    }
    catch (error) {
        res.status(400).json('Erreur lors de la récupération du deck du joueur');
    }
});
// Récuperation des decks
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allDecks = yield decks_1.default.find().sort({ nom: 1 });
        const response = allDecks.map((deck) => ({
            id: deck._id,
            nom: deck.nom,
            userId: deck.userId,
        }));
        res.status(200).json(response);
    }
    catch (e) {
        res.status(400).json('Erreur lors de la récupération des decks');
    }
});
const getDeckIllustration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fuzzyName } = req.query;
    const scryfall = new ScryFall_1.default;
    try {
        const cardsByName = yield scryfall.getCards(fuzzyName);
        const imageUris = yield scryfall.getIllustrationsCards(cardsByName.prints_search_uri);
        res.status(200).json({
            id: cardsByName.id,
            name: cardsByName.name,
            lang: cardsByName.lang,
            imageUris,
        });
    }
    catch (e) {
        res.status(404).json('Nom imprécis. Veuillez affiner votre recherche');
    }
});
// Ajout d'un deck
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deckObject = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    yield decks_1.default.create(Object.assign(Object.assign({}, deckObject), { userId: new mongodb_1.ObjectId(userId), parties: { standard: 0, special: 0 }, victoires: { standard: 0, special: 0 } }))
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield users_1.default.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $inc: { nbrDecks: 1 } });
        res.status(200).json('deck ajouté');
    }))
        .catch(() => res.status(400).json('Erreur lors de l\'ajout du deck'));
});
// Suppression d'un deck
const softDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deckId = req.query.id;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    const deck = yield decks_1.default.findById(deckId);
    if (deck.userId !== userId)
        res.status(401).json({ error: 'Requête non autorisée !' });
    yield decks_1.default.deleteOne({ _id: new mongodb_1.ObjectId(deckId) })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield users_1.default.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $inc: { nbrDecks: -1 } });
        res.status(200).json('Deck supprimé');
    }))
        .catch(() => res.status(400).json('Erreur lors de la suppression du deck'));
});
// Modification d'un deck
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deckObject = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
    const userId = decodedToken.id;
    if (!mongodb_1.ObjectId.isValid(userId))
        throw new Error('userId invalide');
    const deck = yield decks_1.default.findById(deckObject.id);
    if (deck.userId !== userId)
        res.status(401).json({ error: 'Requête non autorisée !' });
    yield decks_1.default.updateOne({ _id: new mongodb_1.ObjectId(deckObject.id) }, { $set: Object.assign({}, deckObject) })
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        res.status(200).json('deck modifié');
    }))
        .catch(() => res.status(400).json('Erreur lors de la modification du deck'));
});
exports.default = { getAll, getMine, add, softDelete, update, getUserDeck, getDeckIllustration };
//# sourceMappingURL=deck.js.map