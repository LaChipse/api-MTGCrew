"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.partiesTypes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.partiesTypes = {
    standard: Number,
    special: Number
};
const decksSchema = new mongoose_1.default.Schema({
    nom: String,
    userId: String,
    couleurs: (Array),
    type: String,
    parties: exports.partiesTypes,
    victoires: exports.partiesTypes,
    isImprime: Boolean,
    rank: String
});
const decks = mongoose_1.default.model('decks', decksSchema);
exports.default = decks;
//# sourceMappingURL=decks.js.map