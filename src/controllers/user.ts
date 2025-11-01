import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb'
import users from '../models/users';
import { config } from '../config/config';
import games, { Game, PlayersBlock } from '../models/games';

interface TokenPayload extends JwtPayload {
    id: string;  // Assurez-vous que l'id est bien de type string
}

// Récupération d'un utilisateur
const getOne = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')
    
    try {
        const user = await users.findById(userId)

        if (!user) res.status(401).json('Requête non authentifiée !')

        if (user) {
            const userObject = user.toObject();
            const { password, _id, ...restUser } = userObject;
            res.status(200).json({ ...restUser, id: _id })
        }
    } catch (error) {
        res.status(400).json('Erreur lors de la récupération de l\'utilisateur')
    }    
}

// Récupération des utilisateurs
const all = async (req, res) => {
    const isStandard = req.params.type === 'true';

    try {
        const allUsers = await users.find().sort({ prenom: 1 });

        const response = await Promise.all(
            allUsers.map(async (user: any): Promise<{
                id: string;
                fullName: string;
                nbrDecks: number;
                partiesJouees: number;
                victoires: number;
                hundredGameWins: number;
                colorStd: string;
                colorSpec: string;
            }> => {
                const lastHundredGames = await games
                    .find({ 'config.userId': user._id.toString(), isStandard })
                    .sort({ date: -1 })
                    .limit(100);

                const wins = countWins(lastHundredGames as any, user._id.toString(), isStandard);;

                const formatLastHundredGames = (): number => {
                    if (lastHundredGames.length > 0) {
                        return lastHundredGames.length === 100
                            ? wins
                            : Math.round((wins / lastHundredGames.length) * 100);
                    }
                    return 0;
                };

                return {
                    id: user._id.toString(),
                    fullName: `${user.prenom} ${user.nom.charAt(0)}.`,
                    nbrDecks: user.nbrDecks,
                    partiesJouees: user.partiesJouees,
                    victoires: user.victoires,
                    hundredGameWins: formatLastHundredGames(),
                    colorStd: user.colorStd,
                    colorSpec: user.colorSpec,
                };
            })
        );

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(400).json('Erreur lors de la récupération des utilisateurs');
    }
};

const countWins = (games: Game[], userId: string, isStandard: boolean): number => {
    return games.reduce<number>((acc, game) => {
        if (isStandard) {
            return acc + (game.victoire === userId ? 1 : 0);
        } else {
            const userConfig = Array.isArray(game.config)
                ? (game.config as PlayersBlock[]).find((c) => c.userId === userId)
                : null;
            if (!userConfig) return acc;
            return acc + (game.victoire === userConfig.role ? 1 : 0);
        }
    }, 0);
};

//Récupere des utilisateurs et de leurs decks
const getUsersWithDecks = async (req, res) => {
    try {
        const allUsers = await users.aggregate([
            { $addFields: { userId: { $toString: "$_id" }}},
            { $lookup: {
                from: "decks",
                localField: "userId",
                foreignField: "userId",
                as: "decks"
            }},
            { $project: {
                _id: 1,
                decks: 1
            }}
        ])

        const response = allUsers.map((user) => (
            {
                id: user._id,
                decks: user.decks
            }
        ))

        res.status(200).json(response)
    } catch (error) {
        res.status(400).json('Erreur lors des decks et utilisateurs')
    }
}

// Mise à jour utilisateur
const update = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    if (!ObjectId.isValid(userId)) throw new Error('userId invalide')

    const { nom, prenom, password, colorStd, colorSpec } = req.body

    try {
        if (password) {
            bcrypt.hash(password, 10)
                .then(async (hash) => {
                    await users.updateOne(
                        { _id: new ObjectId(userId) },
                        {
                            $set: {
                                password: hash
                            }
                        }
                    );
                })
                .catch(error => res.status(500).json({ error }));
        }

        await users.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    nom,
                    prenom,
                    colorStd,
                    colorSpec,
                }
            }
        );

        res.status(200).json({ nom, prenom, colorStd, colorSpec })
    } catch (error) {
        res.status(400).json('Erreur lors de la modification de l\'utilisateur')
    }
}

export default { getOne, update, all, getUsersWithDecks };