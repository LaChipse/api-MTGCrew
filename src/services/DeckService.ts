import decks from "../models/decks";

export default class DeckService {
    constructor() {}

    /**
     * @param {number} rank - Rank du deck
     */
    public async updateRank(rank?: number) {
        let filterUp: Record<string, any> = { $lt: 5, $ne: 0}
        let filterDown: Record<string, any> = { $gt: 1, $ne: 0}

        if (rank) {
            filterUp = {$eq: rank}
            filterDown = {$eq: rank}
        }

        if ((rank && rank <= 5) || !rank) {
            const result = await decks.updateMany(
                { 
                    rank: filterUp,
                    elo: { $gte: 5 }
                },
                { 
                    $set: { elo: 0 },
                    $inc: { rank: 1 }
                }
            );

            return result.modifiedCount
        }

        if ((rank && rank >= 1) || !rank) {
            const result = await decks.updateMany(
                { 
                    rank: filterDown,
                    elo: { $lte: -5 }
                },
                { 
                    $set: { elo: 0 },
                    $inc: { rank: -1 }
                }
            );

            return result.modifiedCount
        }

        return 0
    }
}