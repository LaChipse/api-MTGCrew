import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb'
import users from '../models/users';
import { config } from '../config/config';

interface TokenPayload extends JwtPayload {
    id: string;  // Assurez-vous que l'id est bien de type string
}

// Création d'un utilisateur
const getOne = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

    const userId = decodedToken.id;
    const user = await users.findById(userId)

    if (user) {
        const userObject = user.toObject();
        const { password, _id, ...restUser } = userObject;
        res.status(200).json({...restUser, id: _id})
    }
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

    res.status(200).json('test')

    
}

export default { getOne, update };