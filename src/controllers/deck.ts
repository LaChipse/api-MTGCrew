import jwt, { JwtPayload } from 'jsonwebtoken'
import decks from '../models/decks'
import { ObjectId } from 'mongodb'
import { config } from '../config/config';
import users from '../models/users';
import ScryfallService from '../services/ScryFallService';
import DeckService from '../services/DeckService';
import journals from '../models/journal';

interface TokenPayload extends JwtPayload {
    id: string;
}

// Récuperation de mes decks
const getMine = async (req, res) => {
    let sort: Record<string, -1 | 1> = { nom : 1 }

    if (req.query.sortKey) sort = { [req.query.sortKey]: req.query.sortDirection === '1' ? 1 : -1 };

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;

    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')
    const objectUserId = new ObjectId(userId)

    try {
        const mineDecks = await decks.find({ userId: objectUserId }).sort(sort)

        return res.status(200).json(mineDecks)
    } catch (error) {
        return res.status(400).json('Erreur lors de la récupération des decks')
    }
    
}

// Récuperation des decks d'un joueur
const getUserDeck = async (req, res) => {
    const userId = req.params.id as string;
    let sort: Record<string, -1 | 1> = { nom : 1 }

    if (req.query.sortKey) sort = { [req.query.sortKey]: req.query.sortDirection === '1' ? 1 : -1 };

    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')
    const objectUserId = new ObjectId(userId)

    try {
        const userDecks = await decks.find({ userId: objectUserId }).sort(sort)
    
        return res.status(200).json(userDecks)
    } catch (error) {
        return res.status(400).json('Erreur lors de la récupération du deck du joueur')
    }
}

// Récuperation des decks
const getAll = async (req, res) => {
    const { rank } = req.query;

    let sort: Record<string, -1 | 1> = { nom : 1 }
    const query: Record<string, unknown> = {};

    if (req.query.sortKey) sort = { [req.query.sortKey]: req.query.sortDirection === '1' ? 1 : -1, nom: 1 };
    if (rank) query.rank = rank;

    try {
            const allDecks = await decks.find(query).sort(sort);
            const response = allDecks.map((deck:any) => (
            {
                id: deck._id,
                nom: deck.nom,
                userId: deck.userId,
                rank: deck.rank,
                elo: deck.elo,
                games: {
                    standard: deck.parties.standard,
                    spec: deck.parties.special,
                },
                imageUrl: deck.illustrationUrl,
                imageArt: deck.imageArt
            }
        ))

        return res.status(200).json(response)
    } catch (e) {
        return res.status(400).json('Erreur lors de la récupération des decks')
    }
}

//Mise à jour des ranks
const updateRank = async(req, res) => {
    const deckService = new DeckService

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;

    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')

    try {
        const result = await deckService.updateRank()

        await journals.create({
            idUser: userId,
            body: {userId},
            action: 'Mise à jour des ranks',
            date: new Date()
        });

        return res.status(204).json({ modifiedDeck: result })
    } catch (error) {
        await journals.create({
            idUser: userId,
            body: {error},
            action: 'Mise à jour des ranks',
            date: new Date()
        });
        return res.status(400).json('Erreur lors de la msie a jour des ranks')
    }
}

const getOne = async (req, res) => {
    const deckId = req.params.id as string;

    if (!ObjectId.isValid(deckId)) throw new Error('deckId invalide')
    const objectDeckId = new ObjectId(deckId)

    try {
        const deck = await decks.findById(deckId);
        if (!deck) res.status(404).json('Impossible de trouver le deck')

        return res.status(200).json(deck)
    } catch (e) {
        return res.status(400).json('Erreur lors de la récupération du deck')
    }
}

const getDeckIllustration = async (req, res) => {
    const { fuzzyName } = req.query
    const scryfallService = new ScryfallService

    try {
        const cardsByName = await scryfallService.getCards( fuzzyName );
        const imageUris = await scryfallService.getIllustrationsCards(cardsByName.prints_search_uri)

        return res.status(200).json({
            id: cardsByName.id,
            name: cardsByName.name,
            lang: cardsByName.lang,
            imageUris,
        })
    } catch (e) {
        return res.status(404).json('Nom imprécis. Veuillez affiner votre recherche')
    }
}

// Ajout d'un deck
const add = async (req, res) => {
    const deckObject = req.body;

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')
    
    await decks.create({...deckObject, userId: new ObjectId(userId), parties: {standard: 0, special: 0}, victoires: {standard: 0, special: 0}, elo: 0})
        .then(async () => { 
            await users.updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { nbrDecks: 1 } }
            );

            await journals.create({
                idUser: userId,
                body: {...deckObject},
                action: 'Ajout d\'un deck',
                date: new Date()
            });
            
            return res.status(200).json('deck ajouté')
        })
        .catch(async (error) => {
            await journals.create({
                body: {error},
                action: 'Ajout d\'un deck',
                date: new Date()
            });
            return res.status(400).json('Erreur lors de l\'ajout du deck')
        });
}

// Suppression d'un deck
const softDelete = async (req, res) => {
    const deckId = req.query.id as string
    if (!ObjectId.isValid(deckId)) throw new Error('deckId invalide')

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')

    const deck = await decks.findById(deckId)
    if (!deck) res.status(404).json('Deck introuvable');

    if (deck.userId !== userId) res.status(401).json({ error: 'Requête non autorisée !'});
    
    await decks.deleteOne({ _id: new ObjectId(deckId) })
        .then(async () => { 
            await users.updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { nbrDecks: -1 } }
            );

            await journals.create({
                idUser: userId,
                body: {...deck},
                action: 'Suppression d\'un deck',
                date: new Date()
            });
            
            return res.status(200).json('Deck supprimé')
        })
        .catch(async (error) => {
            await journals.create({
                idUser: userId,
                body: {error},
                action: 'Suppression d\'un deck',
                date: new Date()
            });
            return res.status(400).json('Erreur lors de la suppression du deck')
        });
}

// Modification d'un deck
const update = async (req, res) => {
    const deckObject = req.body;

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')

    const deck = await decks.findById(deckObject.id)

    if (deck.userId !== userId) res.status(401).json({ error: 'Requête non autorisée !'});

    await decks.updateOne(
        { _id: new ObjectId(deckObject.id as string) },
        { $set: { ...deckObject } }
    )
        .then(async () => { 
            return res.status(200).json('Deck modifié')
        })
        .catch(() => res.status(400).json('Erreur lors de la modification du deck'));
}

export default { getAll, getMine, add, softDelete, update, getUserDeck, getDeckIllustration, getOne, updateRank };