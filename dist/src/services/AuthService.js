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
const journal_1 = __importDefault(require("../models/journal"));
class AuthService {
    constructor() { }
    isValidId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.secret_key);
            const userId = decodedToken.id;
            if (!mongodb_1.ObjectId.isValid(userId)) {
                yield journal_1.default.create({
                    action: 'Identification userId',
                    body: { decodedToken, token: token },
                    date: new Date(),
                    idUser: userId,
                });
                return undefined;
            }
            return userId;
        });
    }
}
exports.default = AuthService;
//# sourceMappingURL=AuthService.js.map