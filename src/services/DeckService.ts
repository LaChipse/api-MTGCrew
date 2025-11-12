import decks from "../models/decks";

export default class DeckService {
    constructor() {}

    public async updateRank() {
        const resultUp = await decks.updateMany(
            { 
                rank: { $lt: 5, $ne: 0 },
                elo: { $gte: 5 }
            },
            { 
                $set: { elo: 0 },
                $inc: { rank: 1 }
            }
        );

        const resultDown = await decks.updateMany(
            { 
                rank: { $gt: 1, $ne: 0 },
                elo: { $lte: -5 }
            },
            { 
                $set: { elo: 0 },
                $inc: { rank: -1 }
            }
        );

        return resultDown.modifiedCount + resultUp.modifiedCount
    }
}