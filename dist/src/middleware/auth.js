"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
//Mise en place token et vérification
const auth = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token manquant !' });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
        if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
            return res.status(401).json({ error: 'Token invalide !' });
        }
        // ✅ On attache l'ID à la requête
        req.userId = decodedToken.id;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};
exports.auth = auth;
//# sourceMappingURL=auth.js.map