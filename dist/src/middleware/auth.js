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
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const JournalService_1 = __importDefault(require("../services/JournalService"));
//Mise en place token et vérification
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const journalService = new JournalService_1.default;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            yield journalService.addToJournal({ error: 'Token manquant !', status: 401 }, 'Authentification');
            return res.status(401).json({ error: 'Token manquant !' });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
        if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
            yield journalService.addToJournal({ error: 'Token invalide !', decodedToken, status: 401 }, 'Authentification');
            return res.status(401).json({ error: 'Token invalide !' });
        }
        next();
    }
    catch (error) {
        yield journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error, message: 'Requête non authentifiée' }, 'Authentification');
        return res.status(401).json({ error: 'Requête non authentifiée !' });
    }
});
exports.auth = auth;
//# sourceMappingURL=auth.js.map