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
        const userObject = user.toObject();
        const { password } = userObject, restUser = __rest(userObject, ["password"]);
        return res.status(200).json({ user: restUser, token: jwt.sign({ id: user.id }, 'shhhhh') });
    });
});
exports.default = { signup, login };
//# sourceMappingURL=auth.js.map