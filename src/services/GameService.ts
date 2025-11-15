import * as Scry from "scryfall-sdk";
import users from "../models/users";
import decks from "../models/decks";
import { PlayersBlock } from "../models/games";

export interface gameFilter {
    startDate: string,
    endDate: string,
    winnerId: string, 
    victoryRole: string,
    typeOfVictory: string,
    isRanked: string
}


export default class GameService {
    constructor() {}

    /**
     * Prepare la query pour les requetes
     * @param {string} isStandard - Sommes nous en standard ?
     * @param {gameFilter} filters - Filtres
     */
    public getQuery(isStandard: boolean, filters: gameFilter) {
        const { startDate, endDate, winnerId, victoryRole, typeOfVictory, isRanked } = filters;

        const query: Record<string, unknown> = {
            isStandard,
        };

        let sort: Record<string, -1 | 1> = { date: -1 };

        query.date = {
            $gte: startDate? new Date(startDate) : new Date(0),
            $lte: endDate ? new Date(endDate) : new Date(),
        };

        if (victoryRole || winnerId) query.victoire = winnerId ? winnerId : victoryRole
        if (typeOfVictory) query.typeVictoire = typeOfVictory
        if (!!isRanked) query.isRanked = isRanked === 'true' ? true : false

        return { query, sort }
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
    public async updateUserAndDeck(config: Array<PlayersBlock>, type: string, victoire: string, isStandard: boolean, isRanked: boolean, incr: -1 | 1) {
        const usersIds = (config).map((c) => c.userId)
        const decksIds = (config).map((c) => c.deckId)

        await users.updateMany(
            { _id: { $in: usersIds }},
            { $inc: isStandard ? { 'partiesJouees.standard': incr } : { 'partiesJouees.special': incr } }
        );

        await users.updateMany(
            { _id: { $in: this.victoryIds('userId', type, victoire, config) } },
            {  $inc: isStandard ? { 'victoires.standard': incr } : { 'victoires.special': incr } }
        )
        
        await decks.updateMany(
            { _id: { $in: decksIds }},
            { $inc: {
                elo: isRanked ? -(incr) : 0,
                ...(isStandard ? { 'parties.standard': incr } : { 'parties.special': incr })
            }},
        );

        await decks.updateMany(
            { _id: { $in: this.victoryIds('deckId', type, victoire, config) } },
            {  $inc: {
                elo: isRanked ? (incr * 2) : 0,
                ...(isStandard ? { 'victoires.standard': incr } : { 'victoires.special': incr })
            }},
        );
    }

    private victoryIds(userOrDeck: 'userId' | 'deckId', type: string, victoire: string, config: Array<PlayersBlock>) {
        switch (type) {
            case 'each':
                return (config as Array<PlayersBlock>).filter((c) => c.userId === victoire).map((g) => g[userOrDeck]);
            case 'team':
                return (config as Array<PlayersBlock>).filter((c) => c.team === victoire).map((g) => g[userOrDeck]);
            case 'treachery':
                return (config as Array<PlayersBlock>).filter((c) => {
                    const roleVictoire = victoire === 'Seigneur' ? ['Seigneur', 'Gardien'] : [victoire]
                    return roleVictoire.includes(c.role)
                }).map((g) => g[userOrDeck]);
            case 'archenemy':
                return (config as Array<PlayersBlock>).filter((c) => c.role === victoire).map((g) => g[userOrDeck]);
            default:
                break;
        }
    }
}