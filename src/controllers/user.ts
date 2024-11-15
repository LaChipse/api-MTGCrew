import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb'
import users from '../models/users';
import { config } from '../config/config';

interface TokenPayload extends JwtPayload {
    id: string;  // Assurez-vous que l'id est bien de type string
}

// Récupération d'un utilisateur
const getOne = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    const user = await users.findById(userId)

    if (!user) res.status(401).json({ error: 'Requête non authentifiée !'})

    if (user) {
        const userObject = user.toObject();
        const { password, ...restUser } = userObject;
        res.status(200).json(restUser)
    }
}

// Récupération des utilisateurs
const all = async (req, res) => {
    const allUsers = await users.find().sort({ prenom: 1 })
    const response = allUsers.map((user) => (
        {
            id: user._id,
            fullName: `${user.prenom} ${user.nom.charAt(0)}.`,
            nbrDecks: user.nbrDecks,
            partiesJouees: user.partiesJouees,
            victoires: user.victoires
        }
    ))

    res.status(200).json(response)
}

//Récupere les utilisateurs et leurs decks
const getUsersWithDecks = async (req, res) => {
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
}

// Mise à jour utilisateur
const update = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const { nom, prenom, password } = req.body

    const getPassword = () => {
        if (!password) return {}
        bcrypt.hash(password, 10)
            .then((hash) => ({
                    password: hash
                }))
            .catch(error => res.status(500).json({ error }));
    }

    const userId = decodedToken.id;
    await users.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                nom,
                prenom,
                ...getPassword()
            }
        }
    );

    res.status(200).json({ nom, prenom })
}

export default { getOne, update, all, getUsersWithDecks };