import { ObjectId } from 'mongodb'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/config';
import decks from '../models/decks';
import games, { PlayersBlock } from '../models/games';
import users from '../models/users';

interface TokenPayload extends JwtPayload {
    id: string;
}

// Récuperation de l'historique de mes parties
const history = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    const { startDate, endDate, winnerId, victoryRole, typeOfVictory  } = req.query;

    const query: Record<string, unknown> = {
        isStandard,
    };

    let sort: Record<string, -1 | 1> = { date: -1 };

    query.date = {
        $gte: startDate? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
    };

    if (victoryRole || winnerId) {
        query.victoire = winnerId ? winnerId : victoryRole
    }

    if (typeOfVictory) query.typeVictoire = typeOfVictory

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')

    try {
        const allGames = await games.aggregate([
        {
            $match: {
                "config.userId": userId,
                ...query,
            }
        },
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

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')


    const isStandard = req.params.type === 'true';
    const { startDate, endDate, winnerId, victoryRole, typeOfVictory } = req.query;

    const query: Record<string, unknown> = {
        isStandard,
    };

    query.date = {
        $gte: startDate? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
    };

    if (victoryRole || winnerId) {
        query.victoire = winnerId ? winnerId : victoryRole
    }

    if (typeOfVictory) query.typeVictoire = typeOfVictory

    try {
        const countGames = await games.aggregate([
        {
            $match: {
                "config.userId": userId,
                ...query
            }
        },
        {
            $count:"count"
        }
    ])

    res.status(200).json(countGames?.[0]?.count || 0)
    } catch (error) {
        res.status(400).json('Erreur lors du decompte des parties')
    }
    
}

// Compte le nombre de parties
const count = async (req, res) => {
    const isStandard = req.params.type === 'true';
    const { startDate, endDate, winnerId, victoryRole, typeOfVictory } = req.query;

    const query: Record<string, unknown> = {
        isStandard,
    };

    query.date = {
        $gte: startDate? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
    };

    if (victoryRole || winnerId) {
        query.victoire = winnerId ? winnerId : victoryRole
    }

    if (typeOfVictory) query.typeVictoire = typeOfVictory

    try {
        const countGames = await games.aggregate([
            {
                $match: query
            },
            {
                $count:"count"
            }
        ])

        res.status(200).json(countGames?.[0]?.count || 0)
    } catch (error) {
        res.status(400).json('Erreur lors du decompte des parties')
    }
    
}

// Récuperation des parties
const getAll = async (req, res) => {
    const page = Number(req.params.page) || 1;
    const isStandard = req.params.type === 'true';
    const { startDate, endDate, winnerId, victoryRole, typeOfVictory } = req.query;

    const query: Record<string, unknown> = {
        isStandard,
    };

    query.date = {
        $gte: startDate? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
    };

    if (victoryRole || winnerId) {
        query.victoire = winnerId ? winnerId : victoryRole
    }

    if (typeOfVictory) query.typeVictoire = typeOfVictory

    try {
        const allGames = await games
        .find(query)
        .sort({ date: -1 })
        .skip(20 * (page - 1))
        .limit(20)

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

// Ajout d'une partie
const add = async (req, res) => {
    let winnersSpecial: Array<string> = []
    let winnersStandard: Array<string> = []

    let decksWinnersSpecial: Array<string> = []
    let decksWinnersStandard: Array<string> = []

    const gameObject = req.body;
    const { type, config: configGame, victoire, isStandard } = gameObject

    const tricheryRolVictory = (role: string) => {
        if (victoire === 'Seigneur') return role === victoire || role === 'Gardien'
        return role === victoire
    }

    const usersPlayer = [...new Set(configGame.map((conf: PlayersBlock) => conf.userId))]
    const deckPlayer = [...new Set(configGame.map((conf: PlayersBlock) => conf.deckId))]

    if (isStandard) {
        if (type === 'each') {
            winnersStandard = [victoire]
            decksWinnersStandard = configGame.filter((conf: PlayersBlock) => conf.userId === victoire).map((winner: PlayersBlock) => winner.deckId)
        } else if (type === 'team') {
            winnersStandard = configGame.filter((conf: PlayersBlock) => conf.team === victoire).map((winner: PlayersBlock) => winner.userId)
            decksWinnersStandard = configGame.filter((conf: PlayersBlock) => conf.team === victoire).map((winner: PlayersBlock) => winner.deckId)
        }

        await games.create({...gameObject})
            .then(async () => { 
                await users.updateMany(
                    { _id: { $in: [...new Set(usersPlayer)] }},
                    { $inc: { 'partiesJouees.standard': 1 } }
                );

                await users.updateMany(
                    { _id: { $in: [...new Set(winnersStandard)] }},
                    { $inc: { 'victoires.standard': 1 } }
                );

                await decks.updateMany(
                    { _id: { $in: [...new Set(deckPlayer)] }},
                    { $inc: { 'parties.standard': 1 } }
                );

                await decks.updateMany(
                    { _id: { $in: [...new Set(decksWinnersStandard)] }},
                    { $inc: { 'victoires.standard': 1 } }
                );
                
                res.status(200).json({ config: configGame, victoire })
            })
            .catch(error => res.status(400).json('Erreur lors de la création de la partie'));
    } else {
        if (type === 'treachery') {
            winnersSpecial = configGame.filter((conf: PlayersBlock) => tricheryRolVictory(conf.role)).map((winner: PlayersBlock) => winner.userId)
            decksWinnersSpecial = configGame.filter((conf: PlayersBlock) => tricheryRolVictory(conf.role)).map((winner: PlayersBlock) => winner.deckId)
        } else if (type === 'archenemy') {
            winnersSpecial = configGame.filter((conf: PlayersBlock) => conf.role === victoire).map((winner: PlayersBlock) => winner.userId)
            decksWinnersSpecial = configGame.filter((conf: PlayersBlock) => conf.role === victoire).map((winner: PlayersBlock) => winner.deckId)
        }

        await games.create({...gameObject})
        .then(async () => { 
            await users.updateMany(
                { _id: { $in: [...new Set(usersPlayer)] }},
                { $inc: { 'partiesJouees.special': 1 } }
            );

            await users.updateMany(
                { _id: { $in: [...new Set(winnersSpecial)] }},
                { $inc: { 'victoires.special': 1 } }
            );

            await decks.updateMany(
                { _id: { $in: [...new Set(deckPlayer)] }},
                { $inc: { 'parties.special': 1 } }
            );

            await decks.updateMany(
                { _id: { $in: [...new Set(decksWinnersSpecial)] }},
                { $inc: { 'victoires.special': 1 } }
            );
            
            res.status(200).json({ config: configGame, victoire })
        })
        .catch(error => res.status(400).json('Erreur lors de la création de la partie'));
    }
}

export default { getAll, add, history, count, historyCount };