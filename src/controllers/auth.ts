const jwt = require('jsonwebtoken');

import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import users from '../models/users';
import JournalService from '../services/JournalService';

//Création d'un utilisateur
const signup = async (req: Request, res: Response) => {
    const journalService = new JournalService
    const userObject = req.body;
    if (!userObject.nom || !userObject.prenom || !userObject.password) res.status(422).json('Champ manquant !')
        
    const user = await users.findOne({ nom: userObject.nom, prenom: userObject.prenom })
    if (user) {
        await journalService.addToJournal({ ...userObject, password: 'none', message: 'Cet utilisateur est déjà enregistré !', status: 400 }, 'Sign-up')
        res.status(400).json('Cet utilisateur est déjà enregistré !')
    } else {
        try {
            const hash = await bcrypt.hash(userObject.password, 10);
            await users.create({
                ...userObject,
                password: hash,
                nbrDecks: 0,
                partiesJouees: {
                    standard: 0,
                    special: 0
                },
                victoires: {
                    standard: 0,
                    special: 0
                },
                colorStd: '#27E9FF',
                colorSpec: '#fc79efff',
            });

            await journalService.addToJournal({...userObject, password: hash, status: 201}, 'Sign-up')

            return res.status(201).send('Profil enregistré !')
        } catch (error) {
            await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Sign-up')
            return res.status(500).json('Erreur lors de la création de l\'utilisateur')
        }
    }
}

//Connexion utilisateur
const login = async (req: Request, res: Response) => {
    const journalService = new JournalService

    const userObject = req.body;
    const user = await users.findOne({ nom: userObject.nom, prenom: userObject.prenom })

    if (!user) {
        await journalService.addToJournal({ ...userObject, message: 'Utilisateur non trouvé !', status: 404 }, 'Connexion')
        res.status(404).json('Utilisateur non trouvé !');
    }

    try {
        const valid = await bcrypt.compare(userObject.password, user.password);
        if (!valid) {
            await journalService.addToJournal({ message: 'Mot de passe incorrect !', status: 403 }, 'Connexion')
            return res.status(403).json('Mot de passe incorrect !');
        }

        const { password, _id, ...restUser } = user.toObject();
        const token = jwt.sign({ id: _id }, 'shhhhh');

        const hash = await bcrypt.hash(userObject.password, 10);
        await journalService.addToJournal({...userObject, password: hash}, 'Connexion')

        return res.status(200).json({
            user: { ...restUser, id: _id },
            token
        });
    } catch (error) {
        await journalService.addToJournal(error instanceof Error ? { message: error.message, stack: error.stack } : { error }, 'Connexion')

        return res.status(500).json('Erreur serveur');
    }
}

export default { signup, login };
