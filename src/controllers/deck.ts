import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import decks from '../models/decks';
import { Request, Response } from 'express';
import users from '../models/users';
import AuthService from '../services/AuthService';
import DeckService from '../services/DeckService';
import ScryfallService from '../services/ScryFallService';
import JournalService from '../services/JournalService';

export interface TokenPayload extends JwtPayload {
    id: string;
}

// Récuperation de mes decks
const getMine = async (req: Request, res: Response) => {
    const authService = new AuthService
    let sort: Record<string, -1 | 1> = { nom : 1 }

    if (req.query.sortKey) sort = { [req.query.sortKey as string]: req.query.sortDirection === '1' ? 1 : -1 };

    const userId = await authService.isValidId(req);
    if (!userId) return res.status(422).json('Données reçues invalides');

    const objectUserId = new ObjectId(userId)

    try {
        const mineDecks = await decks.find({ userId: objectUserId }).sort(sort)

        return res.status(200).json(mineDecks)
    } catch (error) {
        return res.status(500).json('Erreur lors de la récupération des decks')
    }
    
}

// Récuperation des decks d'un joueur
const getUserDeck = async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    let sort: Record<string, -1 | 1> = { nom : 1 }

    if (req.query.sortKey) sort = { [req.query.sortKey as string]: req.query.sortDirection === '1' ? 1 : -1 };

    if (!ObjectId.isValid(userId)) return res.status(422).json('Données reçues invalides')
    const objectUserId = new ObjectId(userId)

    try {
        const userDecks = await decks.find({ userId: objectUserId }).sort(sort)
    
        return res.status(200).json(userDecks)
    } catch (error) {
        return res.status(500).json('Erreur lors de la récupération du deck du joueur')
    }
}

// Récuperation des decks
const getAll = async (req: Request, res: Response) => {
    const { rank } = req.query;

    let sort: Record<string, -1 | 1> = { nom : 1 }
    const query: Record<string, unknown> = {};

    if (req.query.sortKey) sort = { [req.query.sortKey as string]: req.query.sortDirection === '1' ? 1 : -1, nom: 1 };
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
const updateRank = async(req: Request, res: Response) => {
    const journalService = new JournalService
    const authService = new AuthService
    const deckService = new DeckService

    const userId = await authService.isValidId(req)
    if (!userId) return res.status(422).json('Données reçues invalides');

    try {
        const result = await deckService.updateRank()
        await journalService.addToJournal({userId, status: 204}, 'Mise à jour des ranks', userId )

        return res.status(204).json({ modifiedDeck: result })
    } catch (error) {
        await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Mise à jour des ranks', userId)

        return res.status(400).json('Erreur lors de la msie a jour des ranks')
    }
}

// Récupération de un seul deck
const getOne = async (req: Request, res: Response) => {
    const deckId = req.params.id as string;

    if (!ObjectId.isValid(deckId)) return res.status(422).json('Données reçues invalides')

    try {
        const deck = await decks.findById(deckId);
        if (!deck) res.status(404).json('Impossible de trouver le deck')

        return res.status(200).json(deck)
    } catch (e) {
        return res.status(500).json('Erreur lors de la récupération du deck')
    }
}

// Récupération de l'illustration
const getDeckIllustration = async (req: Request, res: Response) => {
    const { fuzzyName } = req.query
    const scryfallService = new ScryfallService

    try {
        const cardsByName = await scryfallService.getCards( fuzzyName as string );
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
const add = async (req: Request, res: Response) => {
    const journalService = new JournalService
    const authService = new AuthService
    const deckObject = req.body;

    const userId = await authService.isValidId(req);
    if (!userId) return res.status(422).json('Données reçues invalides');
    
    await decks.create({...deckObject, userId: new ObjectId(userId), parties: {standard: 0, special: 0}, victoires: {standard: 0, special: 0}, elo: 0})
        .then(async () => { 
            await users.updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { nbrDecks: 1 } }
            );

            await journalService.addToJournal({...deckObject, status: 201}, 'Ajout d\'un deck', userId)
            
            return res.status(201).json('Deck ajouté')
        })
        .catch(async (error) => {
            await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Ajout d\'un deck', userId)

            return res.status(500).json('Erreur lors de l\'ajout du deck')
        });
}

// Suppression d'un deck
const softDelete = async (req: Request, res: Response) => {
    const journalService = new JournalService
    const authService = new AuthService

    const deckId = req.query.id as string
    if (!ObjectId.isValid(deckId)) res.status(422).json('Données envoyées invalides');

    const userId = await authService.isValidId(req);
    if (!userId) return res.status(422).json('Données reçues invalides');

    const deck = await decks.findById(deckId)
    if (!deck) {
        await journalService.addToJournal({deckId, status: 404}, 'Suppression d\'un deck', userId)
        return  res.status(404).json('Deck introuvable');
    }

    if (deck.userId !== userId) {
        await journalService.addToJournal({...deck, userId, status: 403}, 'Suppression d\'un deck', userId)
        return res.status(403).json('Requête non autorisée !');
    }
    
    await decks.deleteOne({ _id: new ObjectId(deckId) })
        .then(async () => { 
            await users.updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { nbrDecks: -1 } }
            );

            await journalService.addToJournal({...deck, userId, status: 204}, 'Suppression d\'un deck', userId)

            return res.status(204).json('Deck supprimé')
        })
        .catch(async (error) => {
            await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Suppression d\'un deck', userId)

            return res.status(500).json('Erreur lors de la suppression du deck')
        });
}

// Modification d'un deck
const update = async (req: Request, res: Response) => {
    const journalService = new JournalService
    const authService = new AuthService
    const deckObject = req.body;

    const userId = await authService.isValidId(req)
    if (!userId) return res.status(422).json('Données reçues invalides');

    const deck = await decks.findById(deckObject.id)
    if (!deck) {
        await journalService.addToJournal({deckId: deckObject.id, status: 404}, 'Modification d\'un deck', userId)
        res.status(404).json('Deck introuvable');
    }
    if (deck.userId !== userId) {
        await journalService.addToJournal({...deck, userId, status: 403}, 'Modification d\'un deck', userId)
        res.status(403).json('Requête non autorisée !');
    }

    await decks.updateOne(
        { _id: new ObjectId(deckObject.id as string) },
        { $set: { ...deckObject } }
    )
        .then(async () => { 
            journalService.addToJournal({...deckObject, status: 204}, 'Modification d\'un deck', userId)
            return res.status(204).json('Deck modifié')
        })
        .catch(async (error) => {
            await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Modification d\'un deck', userId)

            return res.status(500).json('Erreur lors de la modification du deck');
        })
}

export default { getAll, getMine, add, softDelete, update, getUserDeck, getDeckIllustration, getOne, updateRank };