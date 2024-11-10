"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const usersSchema = new mongoose_1.default.Schema({
    nom: String,
    prenom: String,
    password: String,
    nbrDecks: Number,
    partiesJouees: Number,
    victoires: Number
});
const users = mongoose_1.default.model('users', usersSchema);
exports.default = users;
//# sourceMappingURL=users.js.map