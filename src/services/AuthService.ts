import { ObjectId } from 'mongodb'
import { TokenPayload } from '../controllers/deck';
import jwt from 'jsonwebtoken'
import { config } from '../config/config';
import journals from '../models/journal';

export default class AuthService {
    constructor() {}

    public async isValidId(req: any) {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, config.secret_key) as TokenPayload;

        const userId = decodedToken.id;
        if (!ObjectId.isValid(userId)) {
            await journals.create({
                action: 'Identification userId',
                body: {decodedToken, token: token},
                date: new Date(),
                idUser: userId,
            })
            return undefined
        }

        return userId
    }
}