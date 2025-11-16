import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import games, { Game } from '../models/games';
import AuthService from '../services/AuthService';
import GameService, { gameFilter } from '../services/GameService';
import JournalService from '../services/JournalService';

// Récuperation de l'historique de mes parties
const history = async (req: Request, res: Response) => {
    const gameService = new GameService
    const authService = new AuthService

    const userId = await authService.isValidId(req);
    if (!userId) return res.status(422).json('Données reçues invalides');

    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    
    try {
        const { query, sort } = gameService.getQuery(isStandard, req.query as unknown as gameFilter)

        const allGames = await games.aggregate([
            { $match: {
                    "config.userId": userId,
                    ...query,
            }},
            { $sort: sort },
            { $skip: 10 * (page - 1) },
            { $limit : 10 }
        ])

        const response = allGames.map((game) => (
            {
                id: game._id,
                date: game.date,
                type: game.type,
                config: game.config,
                victoire: game.victoire, 
                typeVictoire: game.typeVictoire,
                isRanked: game.isRanked
            }
        ))

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json('Erreur lors de la récupération des parties')
    }
}


// Compte le nombre de parties
const historyCount = async (req: Request, res: Response) => {
    const authService = new AuthService
    const gameService = new GameService

    const userId = await authService.isValidId(req);
    if (!userId) return res.status(422).json('Données reçues invalides');

    const isStandard = req.params.type === 'true';
    
    try {
        const { query } = gameService.getQuery(isStandard, req.query as unknown as gameFilter)

        const countGames = await games.aggregate([
            { $match: {
                    "config.userId": userId,
                    ...query
            }},
            { $count:"count" }
        ])

        return res.status(200).json(countGames?.[0]?.count || 0)
    } catch (error) {
        return res.status(500).json('Erreur lors du decompte des parties')
    }
}

// Compte le nombre de parties
const count = async (req: Request, res: Response) => {
    const gameService = new GameService

    const isStandard = req.params.type === 'true';
    
    try {
        const { query } = gameService.getQuery(isStandard, req.query as unknown as gameFilter)

        const countGames = await games.aggregate([
            { $match: query },
            { $count:"count" }
        ])

        return res.status(200).json(countGames?.[0]?.count || 0)
    } catch (error) {
        return res.status(500).json('Erreur lors du decompte des parties')
    }
    
}

// Récuperation des parties
const getAll = async (req: Request, res: Response) => {
    const gameService = new GameService

    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    
    try {
        const { query, sort } = gameService.getQuery(isStandard, req.query as unknown as gameFilter)

        const allGames = await games
            .find(query)
            .sort(sort)
            .skip(20 * (page - 1))
            .limit(20)

        const response = allGames.map((game: any) => ({
                id: game._id,
                date: game.date,
                type: game.type,
                config: game.config,
                victoire: game.victoire, 
                typeVictoire: game.typeVictoire,
                isRanked: game.isRanked
            }))

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json('Erreur lors de la récupération des parties')
    }
    
}

// Ajout d'une partie
const add = async (req: Request, res: Response) => {
    const journalService = new JournalService
    const authService = new AuthService
    const gameService = new GameService

    const gameObject = req.body as Game;
    const { config: configParties, victoire, type, isStandard, isRanked } = gameObject

    const userId = await authService.isValidId(req);
    if (!userId) return res.status(422).json('Données reçues invalides');

    // const deckService = new DeckService

    try {
        await games.create({...gameObject})
        await gameService.updateUserAndDeck(configParties, type, victoire, isStandard, isRanked, 1)
        // await deckService.updateRank()

        await journalService.addToJournal({...gameObject, status: 201}, 'Ajout partie', userId)

        return res.status(201).json({ config: configParties, victoire })
    } catch (error) {
        await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Ajout partie', userId)

        return res.status(500).json('Erreur lors de la création de la partie');
    }
}


// Suppression d'une partie
const hardDelete = async (req: Request, res: Response) => {
    const journalService = new JournalService
    const authService = new AuthService
    const gameService = new GameService

    const userId = await authService.isValidId(req);
    if (!userId) return res.status(422).json('Données reçues invalides');

    const gameId = req.query.id as string;
    if (!ObjectId.isValid(gameId)) res.status(422).json('Données reçues invalides')

    try {
        const game = await games.findById(gameId)
        if (!game) {
            await journalService.addToJournal({gameId, status: 404}, 'Suppression partie', userId)
            return res.status(404).json('Partie introuvable');
        }

        const { config, victoire, type, isStandard, isRanked } = game

        await games.deleteOne({ _id: new ObjectId(gameId) })
        await gameService.updateUserAndDeck(config, type, victoire, isStandard, isRanked, -1)
        
        await journalService.addToJournal({...game, status: 200}, 'Suppression partie', userId)
        return res.status(200).json({ id: game._id, type, config, victoire, typeVictoire: game.typeVictoire, isStandard })
    } catch (error) {
        await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Suppression partie', userId)

        return res.status(500).json('Erreur lors de la suppression de la partie')
    }
}

export default { getAll, add, history, count, historyCount, hardDelete };