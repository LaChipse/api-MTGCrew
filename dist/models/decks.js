"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const decksSchema = new mongoose_1.default.Schema({
    nom: String,
    userId: String,
    couleurs: (Array),
    type: String,
    parties: Number,
    victoires: Number,
    isImprime: Boolean,
    rank: String
});
const decks = mongoose_1.default.model('decks', decksSchema);
exports.default = decks;
//# sourceMappingURL=decks.js.map