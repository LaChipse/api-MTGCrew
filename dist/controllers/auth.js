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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = require('jsonwebtoken');
const users_1 = __importDefault(require("../models/users"));
//Création d'un utilisateur
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userObject = req.body;
    const user = yield users_1.default.findOne({ nom: userObject.nom, prenom: userObject.prenom });
    if (user) {
        res.status(401).json('Cet utilisateur est déjà enregistré !');
    }
    else {
        bcrypt_1.default.hash(userObject.password, 10)
            .then((hash) => {
            users_1.default.create(Object.assign(Object.assign({}, userObject), { password: hash, nbrDecks: 0, partiesJouees: 0, victoires: 0 }))
                .then(() => { res.status(201).send('Profil enregistré !'); })
                .catch(error => res.status(400).json({ error }));
        })
            .catch(error => res.status(500).json({ error }));
    }
});
//Connexion utilisateur
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userObject = req.body;
    const user = yield users_1.default.findOne({ nom: userObject.nom, prenom: userObject.prenom });
    if (!user) {
        return res.status(404).json('Utilisateur non trouvé !');
    }
    bcrypt_1.default.compare(userObject.password, user.password)
        .then(valid => {
        if (!valid) {
            return res.status(403).json('Mot de passe incorrect !');
        }
        return res.status(200).json({ userId: user.id, token: jwt.sign({ id: user.id }, 'shhhhh', { expiresIn: '24h' }) });
    });
});
exports.default = { signup, login };
//# sourceMappingURL=auth.js.map