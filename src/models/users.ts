import mongoose, { ObjectId }  from 'mongoose';
import { partiesTypes, PartiesTypes } from './decks';

export interface User {
    _id: ObjectId
    nom: string,
    prenom: string,
    password: string
    nbrDecks: number,
    partiesJouees: PartiesTypes,
    victoires: PartiesTypes,
    colorStd: string,
    colorSpec: string,
}

const usersSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    password: String,
    nbrDecks: Number,
    partiesJouees: partiesTypes,
    victoires: partiesTypes,
    colorStd: String,
    colorSpec: String,
});

const users = mongoose.model('users', usersSchema);

export default users;