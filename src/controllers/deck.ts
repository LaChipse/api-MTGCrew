import jwt, { JwtPayload } from 'jsonwebtoken'
import decks from '../models/decks'
import { ObjectId } from 'mongodb'
import { config } from '../config/config';
import * as Scry from "scryfall-sdk";
import users from '../models/users';

interface TokenPayload extends JwtPayload {
    id: string;
}

// Récuperation de mes decks
const getMine = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    const objectUserId = new ObjectId(userId)
    const mineDecks = await decks.find({ userId: objectUserId }).sort({ nom: 1 })

    res.status(200).json(mineDecks)
}

// Récuperation des decks d'un joueur
const getUserDeck = async (req, res) => {
    const userId = req.params.id as string;
    const objectUserId = new ObjectId(userId)
    const userDecks = await decks.find({ userId: objectUserId }).sort({ nom: 1 })

    res.status(200).json(userDecks)
}

// Récuperation des decks
const getAll = async (req, res) => {
    const allDecks = await decks.find().sort({ nom: 1 })

    const response = allDecks.map((deck) => (
        {
            id: deck._id,
            nom: deck.nom,
            userId: deck.userId,
        }
    ))

    res.status(200).json(response)
}

const getDeckIllustration = async (req, res) => {
    const { fuzzyName } = req.query

    try {
        const cardsByName = await Scry.Cards.byName(fuzzyName, true);
        let imageUris: Array<Record<string, any>>;

        if (cardsByName.card_faces && Array.isArray(cardsByName.card_faces) && cardsByName.card_faces.length > 0) {
            imageUris = cardsByName.card_faces.map((cf) => (
                {
                    imageUrlSmall: cf.image_uris.small,
                    imageUrlNormal: cf.image_uris.normal,
                }
            ))
        } else imageUris = [{
            imageUrlSmall: cardsByName.image_uris.small,
            imageUrlNormal: cardsByName.image_uris.normal
        }]
        res.status(200).json({
            id: cardsByName.id,
            name: cardsByName.name,
            lang: cardsByName.lang,
            imageUris,
        })
    } catch (error) {
        console.debug('ERROR', error)
    }
}

// Ajout d'un deck
const add = async (req, res) => {
    const deckObject = req.body;
    
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    await decks.create({...deckObject, userId: new ObjectId(userId), parties: {standard: 0, special: 0}, victoires: {standard: 0, special: 0}})
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

export default { getAll, getMine, add, softDelete, update, getUserDeck, getDeckIllustration };