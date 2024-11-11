import mongoose, { ObjectId }  from 'mongoose';

export interface Deck {
    _id: ObjectId,
    nom: string,
    userId: string,
    couleurs: Array<string>,
    type?: string, 
    parties: number,
    victoires: number,
    isImprime: boolean,
    rank: string
}

const decksSchema = new mongoose.Schema({
    nom: String,
    userId: String,
    couleurs: Array<String>,
    type: String, 
    parties: Number,
    victoires: Number,
    isImprime: Boolean,
    rank: String
});

const decks = mongoose.model('decks', decksSchema);

export default decks;