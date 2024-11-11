import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { config } from '../config/config';
import { format } from 'date-fns';
import decks from '../models/decks';
import games, { PlayersBlock } from '../models/games';
import users from '../models/users';
import deck from './deck';

interface TokenPayload extends JwtPayload {
    id: string;
}

// Récuperation de mes decks
const history = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    const allGames = await games.aggregate([
        {
            $match: {
                "config.userId": userId
            }
        }
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
}

// Compte le nombre de parties
const count = async (req, res) => {
    const countGames = await games.aggregate([
        {
            $count:"count"
        }
    ])

    res.status(200).json(countGames?.[0]?.count || 0)
}

// Récuperation des parties
const getAll = async (req, res) => {
    const allGames = await games.find()

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
}

// Ajout d'une partie
const add = async (req, res) => {
    let winners: Array<string> = []
    let decksWinners: Array<string> = []

    const gameObject = req.body;
    const { date, type, config: configGame, victoire } = gameObject

    const tricheryRolVictory = (role: string) => {
        if (victoire === 'Seigneur') return role === victoire|| role === 'Gardien'
        return role === victoire
    }

    const formatDate = date ? format(date, 'dd/MM/yyyy') : ''
    const usersPlayer = [...new Set(configGame.map((conf: PlayersBlock) => conf.userId))]
    const deckPlayer = [...new Set(configGame.map((conf: PlayersBlock) => conf.deckId))]

    if (type === 'each') {
        winners = [victoire]
        decksWinners = configGame.filter((conf: PlayersBlock) => conf.userId === victoire).map((winner: PlayersBlock) => winner.deckId)
    } else if (type === 'team') {
        winners = configGame.filter((conf: PlayersBlock) => conf.team === victoire).map((winner: PlayersBlock) => winner.userId)
        decksWinners = configGame.filter((conf: PlayersBlock) => conf.team === victoire).map((winner: PlayersBlock) => winner.deckId)
    } else if (type === 'treachery') {
        winners = configGame.filter((conf: PlayersBlock) => tricheryRolVictory(conf.role)).map((winner: PlayersBlock) => winner.userId)
        decksWinners = configGame.filter((conf: PlayersBlock) => tricheryRolVictory(conf.role)).map((winner: PlayersBlock) => winner.deckId)
    }

    await games.create({...gameObject, date: formatDate})
        .then(async () => { 
            await users.updateMany(
                { _id: { $in: [...new Set(usersPlayer)] }},
                { $inc: { partiesJouees: 1 } }
            );

            await users.updateMany(
                { _id: { $in: [...new Set(winners)] }},
                { $inc: { victoires: 1 } }
            );

            await decks.updateMany(
                { _id: { $in: [...new Set(deckPlayer)] }},
                { $inc: { parties: 1 } }
            );

            await decks.updateMany(
                { _id: { $in: [...new Set(decksWinners)] }},
                { $inc: { victoires: 1 } }
            );
            
            res.status(200).json({ config: configGame, victoire })
        })
        .catch(error => res.status(400).json({ error }));
}

export default { getAll, add, history, count };