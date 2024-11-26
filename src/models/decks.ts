import mongoose, { ObjectId }  from 'mongoose';

export interface PartiesTypes {
    standard: number,
    special: number
}

export const partiesTypes = {
    standard: Number,
    special: Number
}

export interface Deck {
    _id: ObjectId,
    nom: string,
    userId: string,
    couleurs: Array<string>,
    type?: string, 
    parties: PartiesTypes,
    victoires: PartiesTypes,
    isImprime: boolean,
    rank: string
}

const decksSchema = new mongoose.Schema({
    nom: String,
    userId: String,
    couleurs: Array<String>,
    type: String, 
    parties: partiesTypes,
    victoires: partiesTypes,
    isImprime: Boolean,
    rank: String
});

const decks = mongoose.model('decks', decksSchema);

export default decks;