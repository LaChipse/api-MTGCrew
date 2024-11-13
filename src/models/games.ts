import mongoose, { ObjectId }  from 'mongoose';

export interface PlayersBlock {
    joueur?: string,
    userId?: string,
    deck?: string,
    deckId?: string,
    team?: string,
    role?: string
}   

export interface Game {
    _id: ObjectId,
    date?: Date,
    type: string,
    config: Array<PlayersBlock>,
    victoire: string, 
    typeVictoire: string
}

const gamesSchema = new mongoose.Schema({
    date: Date,
    type: String,
    config: Array<PlayersBlock>,
    victoire: String, 
    typeVictoire: String
});

const games = mongoose.model('games', gamesSchema);

export default games;