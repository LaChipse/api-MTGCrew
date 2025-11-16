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
const mongodb_1 = require("mongodb");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const JournalService_1 = __importDefault(require("./JournalService"));
class AuthService {
    constructor() { }
    /**
     * Vérifie si le userId du token est valide
     * @param {Request} req - Requete reçue
     */
    isValidId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const journalService = new JournalService_1.default;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
            const userId = decodedToken.id;
            if (!mongodb_1.ObjectId.isValid(userId)) {
                yield journalService.addToJournal({ decodedToken, token: token }, 'Identification userId', userId);
                return undefined;
            }
            return userId;
        });
    }
}
exports.default = AuthService;
//# sourceMappingURL=AuthService.js.map