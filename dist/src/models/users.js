"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const decks_1 = require("./decks");
const usersSchema = new mongoose_1.default.Schema({
    nom: String,
    prenom: String,
    password: String,
    nbrDecks: Number,
    partiesJouees: decks_1.partiesTypes,
    victoires: decks_1.partiesTypes,
    colorStd: String,
    colorSpec: String,
});
const users = mongoose_1.default.model('users', usersSchema);
exports.default = users;
//# sourceMappingURL=users.js.map