"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const gamesSchema = new mongoose_1.default.Schema({
    date: Date,
    type: String,
    config: (Array),
    victoire: String,
    typeVictoire: String,
    isStandard: Boolean,
    isRanked: Boolean
});
const games = mongoose_1.default.model('games', gamesSchema);
exports.default = games;
//# sourceMappingURL=games.js.map