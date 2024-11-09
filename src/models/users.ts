import mongoose  from 'mongoose';

export interface User {
    nom: string,
    prenom: string,
    password: string
    nbrDecks: number,
    partiesJouees: number,
    victoires: number
}

const usersSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    password: String,
    nbrDecks: Number,
    partiesJouees: Number,
    victoires: Number
});

const users = mongoose.model('users', usersSchema);

export default users;