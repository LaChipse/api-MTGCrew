import jwt, { JwtPayload } from 'jsonwebtoken'
import decks, { Deck } from '../models/decks'
import { ObjectId } from 'mongodb'
import { config } from '../config/config';
import users, { User } from '../models/users';

interface TokenPayload extends JwtPayload {
    id: string;
}

// Récuperation de mes decks
const getMine = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    const tes = new ObjectId(userId)
    const mineDecks = await decks.find({ userId: tes }).sort({ nom: 1 })

    res.status(200).json(mineDecks)
}

// Récuperation des decks
const getAll = async (req, res) => {
    const allDecks = await decks.aggregate<Deck & { users: Array<User> }>([
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "users"
            }
        },
        {
            $sort : { nom: 1 }
        }
    ])

    const response = allDecks.map((deck) => (
        {
            id: deck._id,
            nom: deck.nom,
            userId: deck.userId,
            userFullName: `${deck.users[0]?.prenom} ${deck.users[0]?.nom.charAt(0)}.`
        }
    ))

    res.status(200).json(response)
}

// Ajout d'un deck
const add = async (req, res) => {
    const deckObject = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    await decks.create({...deckObject, userId: new ObjectId(userId), parties: 0, victoires: 0})
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

export default { getAll, getMine, add, softDelete, update };