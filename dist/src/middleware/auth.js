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
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
        if (!decodedToken)
            res.status(402).json({ error: 'Requête non authentifiée !' });
        if (typeof decodedToken === "object" && "id" in decodedToken)
            next();
        else
            console.error("Invalid token or token does not contain an 'id' property.");
    }
    catch (_a) {
        res.status(401).json('Requête non authentifiée !');
    }
};
exports.auth = auth;
//# sourceMappingURL=auth.js.map