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
const decks_1 = __importDefault(require("../models/decks"));
class DeckService {
    constructor() { }
    /**
     * @param {number} rank - Rank du deck
     */
    updateRank(rank) {
        return __awaiter(this, void 0, void 0, function* () {
            let filterUp = { $lt: 5, $ne: 0 };
            let filterDown = { $gt: 1, $ne: 0 };
            if (rank) {
                filterUp = { $eq: rank };
                filterDown = { $eq: rank };
            }
            if ((rank && rank <= 5) || !rank) {
                const result = yield decks_1.default.updateMany({
                    rank: filterUp,
                    elo: { $gte: 5 }
                }, {
                    $set: { elo: 0 },
                    $inc: { rank: 1 }
                });
                return result.modifiedCount;
            }
            if ((rank && rank >= 1) || !rank) {
                const result = yield decks_1.default.updateMany({
                    rank: filterDown,
                    elo: { $lte: -5 }
                }, {
                    $set: { elo: 0 },
                    $inc: { rank: -1 }
                });
                return result.modifiedCount;
            }
            return 0;
        });
    }
}
exports.default = DeckService;
//# sourceMappingURL=DeckService.js.map