import { ObjectId } from 'mongodb'
import { Request } from 'express';
import { TokenPayload } from '../controllers/deck';
import jwt from 'jsonwebtoken'
import { config } from '../config/config';
import JournalService from './JournalService';

export default class AuthService {
    constructor() {}

    /**
     * Vérifie si le userId du token est valide
     * @param {Request} req - Requete reçue
     */
    public async isValidId(req: Request) {
        const journalService = new JournalService
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

        const userId = decodedToken.id;
        if (!ObjectId.isValid(userId)) {
            await journalService.addToJournal({decodedToken, token: token}, 'Identification userId', userId)
            return undefined
        }

        return userId
    }
}