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
const users_1 = __importDefault(require("../models/users"));
const decks_1 = __importDefault(require("../models/decks"));
class GameService {
    constructor() { }
    /**
     * Prepare la query pour les requetes
     * @param {string} isStandard - Sommes nous en standard ?
     * @param {gameFilter} filters - Filtres
     */
    getQuery(isStandard, filters) {
        const { startDate, endDate, winnerId, victoryRole, typeOfVictory, isRanked } = filters;
        const query = {
            isStandard,
        };
        let sort = { date: -1 };
        query.date = {
            $gte: startDate ? new Date(startDate) : new Date(0),
            $lte: endDate ? new Date(endDate) : new Date(),
        };
        if (victoryRole || winnerId)
            query.victoire = winnerId ? winnerId : victoryRole;
        if (typeOfVictory)
            query.typeVictoire = typeOfVictory;
        if (!!isRanked)
            query.isRanked = isRanked === 'true' ? true : false;
        return { query, sort };
    }
    /**
     * Met à jour les users et decks selon la configuration de la partie
     * @param {Array<PlayersBlock>} config - Configuration de la partie
     * @param {tring} type - Type de partie
     * @param {tring} victoire - Qui a gagné
     * @param {boolean} isStandard - Sommes nous en standard ?
     * @param {boolen} isRanked - Est-elle classée ?
     * @param {number} incr - Type d'incrémentation
     */
    updateUserAndDeck(config, type, victoire, isStandard, isRanked, incr) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersIds = (config).map((c) => c.userId);
            const decksIds = (config).map((c) => c.deckId);
            yield users_1.default.updateMany({ _id: { $in: usersIds } }, { $inc: isStandard ? { 'partiesJouees.standard': incr } : { 'partiesJouees.special': incr } });
            yield users_1.default.updateMany({ _id: { $in: this.victoryIds('userId', type, victoire, config) } }, { $inc: isStandard ? { 'victoires.standard': incr } : { 'victoires.special': incr } });
            yield decks_1.default.updateMany({ _id: { $in: decksIds } }, { $inc: Object.assign({ elo: isRanked ? -(incr) : 0 }, (isStandard ? { 'parties.standard': incr } : { 'parties.special': incr })) });
            yield decks_1.default.updateMany({ _id: { $in: this.victoryIds('deckId', type, victoire, config) } }, { $inc: Object.assign({ elo: isRanked ? (incr * 2) : 0 }, (isStandard ? { 'victoires.standard': incr } : { 'victoires.special': incr })) });
        });
    }
    victoryIds(userOrDeck, type, victoire, config) {
        switch (type) {
            case 'each':
                return config.filter((c) => c.userId === victoire).map((g) => g[userOrDeck]);
            case 'team':
                return config.filter((c) => c.team === victoire).map((g) => g[userOrDeck]);
            case 'treachery':
                return config.filter((c) => {
                    const roleVictoire = victoire === 'Seigneur' ? ['Seigneur', 'Gardien'] : [victoire];
                    return roleVictoire.includes(c.role);
                }).map((g) => g[userOrDeck]);
            case 'archenemy':
                return config.filter((c) => c.role === victoire).map((g) => g[userOrDeck]);
            default:
                break;
        }
    }
}
exports.default = GameService;
//# sourceMappingURL=GameService.js.map