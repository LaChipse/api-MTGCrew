import jwt from 'jsonwebtoken'
import { config } from '../config/config';
import { Request, Response, NextFunction } from 'express';
import JournalService from '../services/JournalService';

//Mise en place token et vérification
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const journalService = new JournalService
    
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            await journalService.addToJournal({ error: 'Token manquant !', status: 401 }, 'Authentification')
            return res.status(401).json({ error: 'Token manquant !' });
        }

        const decodedToken = jwt.verify(token, config.secret_key);
        if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
            await journalService.addToJournal({ error: 'Token invalide !', decodedToken, status: 401 }, 'Authentification')
            return res.status(401).json({ error: 'Token invalide !' });
        }

        next();
    } catch (error) {
        await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error, message: 'Requête non authentifiée' }, 'Authentification')
        return res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};