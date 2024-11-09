import jwt, { JwtPayload } from 'jsonwebtoken'
import decks from '../models/decks'
import { ObjectId } from 'mongodb'
import { config } from '../config/config';
import users from '../models/users';

interface TokenPayload extends JwtPayload {
    id: string;
}

// Récuperation des decks
const getAll = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    const allDecks = await decks.find({userId: userId})

    res.status(200).json(allDecks)
}

// Ajout d'un deck
const add = async (req, res) => {
    const deckObject = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    await decks.create({...deckObject, userId, parties: 0, victoires: 0})
        .then(async () => { 
            await users.updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { nbrDecks: 1 } }
            );
            
            res.status(200).json('deck ajouté')
        })
        .catch(error => res.status(400).json({ error }));
}

// Suppression d'un deck
const softDelete = async (req, res) => {
    const deckId = req.query.id as string

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    const deck = await decks.findById(deckId)

    if (deck.userId !== userId) res.status(401).json({ error: 'Requête non autorisée !'});
    await decks.deleteOne({ _id: new ObjectId(deckId) })
        .then(async () => { 
            await users.updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { nbrDecks: -1 } }
            );
            
            res.status(200).json('deck supprimé')
        })
}

// Modification d'un deck
const update = async (req, res) => {
    const deckObject = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    const deck = await decks.findById(deckObject.id)

    if (deck.userId !== userId) res.status(401).json({ error: 'Requête non autorisée !'});

    await decks.updateOne(
        { _id: new ObjectId(deckObject.id as string) },
        { $set: { ...deckObject } }
    )
        .then(async () => { 
            res.status(200).json('deck modifié')
        })
        .catch(error => res.status(400).json({ error }));
}

export default { getAll, add, softDelete, update };