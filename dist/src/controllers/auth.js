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
const jwt = require('jsonwebtoken');
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = __importDefault(require("../models/users"));
const JournalService_1 = __importDefault(require("../services/JournalService"));
//Création d'un utilisateur
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const journalService = new JournalService_1.default;
    const userObject = req.body;
    if (!userObject.nom || !userObject.prenom || !userObject.password)
        res.status(422).json('Champ manquant !');
    const user = yield users_1.default.findOne({ nom: userObject.nom, prenom: userObject.prenom });
    if (user) {
        yield journalService.addToJournal(Object.assign(Object.assign({}, userObject), { message: 'Cet utilisateur est déjà enregistré !', status: 400 }), 'Sign-up');
        res.status(400).json('Cet utilisateur est déjà enregistré !');
    }
    else {
        try {
            const hash = yield bcrypt_1.default.hash(userObject.password, 10);
            const newUser = yield users_1.default.create(Object.assign(Object.assign({}, userObject), { password: hash, nbrDecks: 0, partiesJouees: {
                    standard: 0,
                    special: 0
                }, victoires: {
                    standard: 0,
                    special: 0
                }, colorStd: '#27E9FF', colorSpec: '#fc79efff' }));
            yield journalService.addToJournal(Object.assign(Object.assign({}, newUser.toObject()), { status: 201 }), 'Sign-up');
            return res.status(201).send('Profil enregistré !');
        }
        catch (error) {
            yield journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Sign-up');
            return res.status(500).json('Erreur lors de la création de l\'utilisateur');
        }
    }
});
//Connexion utilisateur
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const journalService = new JournalService_1.default;
    const userObject = req.body;
    const user = yield users_1.default.findOne({ nom: userObject.nom, prenom: userObject.prenom });
    if (!user) {
        yield journalService.addToJournal(Object.assign(Object.assign({}, userObject), { message: 'Utilisateur non trouvé !', status: 404 }), 'Connexion');
        res.status(404).json('Utilisateur non trouvé !');
    }
    try {
        const valid = yield bcrypt_1.default.compare(userObject.password, user.password);
        if (!valid) {
            yield journalService.addToJournal({ message: 'Mot de passe incorrect !', status: 403 }, 'Connexion');
            return res.status(403).json('Mot de passe incorrect !');
        }
        const _a = user.toObject(), { password, _id } = _a, restUser = __rest(_a, ["password", "_id"]);
        const token = jwt.sign({ id: _id }, 'shhhhh');
        yield journalService.addToJournal(Object.assign({}, userObject), 'Connexion');
        return res.status(200).json({
            user: Object.assign(Object.assign({}, restUser), { id: _id }),
            token
        });
    }
    catch (error) {
        yield journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Connexion');
        return res.status(500).json('Erreur serveur');
    }
});
exports.default = { signup, login };
//# sourceMappingURL=auth.js.map