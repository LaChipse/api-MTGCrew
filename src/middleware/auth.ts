import jwt from 'jsonwebtoken'
import { config } from '../config/config';


//Mise en place token et vérification
export const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token manquant !' });
        }

        const decodedToken = jwt.verify(token, config.secret_key);
        if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
            return res.status(401).json({ error: 'Token invalide !' });
        }

        // ✅ On attache l'ID à la requête
        req.userId = decodedToken.id;

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};