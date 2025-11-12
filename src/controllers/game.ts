import { ObjectId } from 'mongodb'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/config';
import games, { Game } from '../models/games';
import GameService from '../services/GameService';
import DeckService from '../services/DeckService';

interface TokenPayload extends JwtPayload {
    id: string;
}

// Récuperation de l'historique de mes parties
const history = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;
    const gameService = new GameService

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')

    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    const { query, sort } = gameService.getQuery(isStandard, req.query)

    try {
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
                typeVictoire: game.typeVictoire
            }
        ))

        res.status(200).json(response)
    } catch (error) {
        res.status(400).json('Erreur lors de la récupération des parties')
    }
    
}


// Compte le nombre de parties
const historyCount = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;
    const gameService = new GameService

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')

    const isStandard = req.params.type === 'true';
    const { query } = gameService.getQuery(isStandard, req.query)

    try {
        const countGames = await games.aggregate([
        { $match: {
                "config.userId": userId,
                ...query
        }},
        { $count:"count" }
    ])

    res.status(200).json(countGames?.[0]?.count || 0)
    } catch (error) {
        res.status(400).json('Erreur lors du decompte des parties')
    }
    
}

// Compte le nombre de parties
const count = async (req, res) => {
    const gameService = new GameService

    const isStandard = req.params.type === 'true';
    const { query } = gameService.getQuery(isStandard, req.query)

    try {
        const countGames = await games.aggregate([
            { $match: query },
            { $count:"count" }
        ])

        res.status(200).json(countGames?.[0]?.count || 0)
    } catch (error) {
        res.status(400).json('Erreur lors du decompte des parties')
    }
    
}

// Récuperation des parties
const getAll = async (req, res) => {
    const gameService = new GameService

    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    const { query, sort } = gameService.getQuery(isStandard, req.query)

    try {
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
                typeVictoire: game.typeVictoire
            }))

        res.status(200).json(response)
    } catch (error) {
        res.status(400).json('Erreur lors de la récupération des parties')
    }
    
}

// Ajout d'une partie
const add = async (req, res) => {
    const gameObject = req.body as Game;
    const { config, victoire, type, isStandard, isRanked } = gameObject

    const gameService = new GameService
    const deckService = new DeckService

    try {
        await games.create({...gameObject})
        await gameService.updateUserAndDeck(config, type, victoire, isStandard, isRanked, 1)
        // await deckService.updateRank()

        res.status(200).json({ config, victoire })
    } catch (error) {
        res.status(400).json('Erreur lors de la création de la partie');
    }
}


// Suppression d'une partie
const hardDelete = async (req, res) => {
    const gameId = req.query.id as string;
    if (!ObjectId.isValid(gameId)) throw new Error('gameId invalide')
    
    const gameService = new GameService

    try {
        const game = await games.findById(gameId)
        if (!game) res.status(404).json('Partie introuvable');

        const { config, victoire, type, isStandard, isRanked } = game

        await games.deleteOne({ _id: new ObjectId(gameId) })
        await gameService.updateUserAndDeck(config, type, victoire, isStandard, isRanked, -1)

        res.status(200).json({ id: game._id, type, config, victoire, typeVictoire: game.typeVictoire, isStandard })
    } catch (error) {
        res.status(400).json('Erreur lors de la suppression de la partie')
    }
}

export default { getAll, add, history, count, historyCount, hardDelete };