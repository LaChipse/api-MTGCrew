import jwt from 'jsonwebtoken'
import { config } from '../config/config';


//Mise en place token et vérification
export const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, config.secret_key);

        if (!decodedToken) res.status(402).json({ error: 'Requête non authentifiée !'});

        if (typeof decodedToken === "object" && "id" in decodedToken) next();
        else console.error("Invalid token or token does not contain an 'id' property.");
    } catch {
        res.status(401).json('Requête non authentifiée !');
    }
};