const jwt = require('jsonwebtoken');

import bcrypt from 'bcrypt';
import users from '../models/users';
import journals from '../models/journal';

//Création d'un utilisateur
const signup = async (req, res) => {
    const userObject = req.body;
    if (!userObject.nom || !userObject.prenom || !userObject.password) res.status(422).json('Champ manquant !')
        
    const user = await users.findOne({ nom: userObject.nom, prenom: userObject.prenom })
    if (user) {
        res.status(400).json('Cet utilisateur est déjà enregistré !')
    } else {
        try {
            const hash = await bcrypt.hash(userObject.password, 10);
            const newUser = await users.create({
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

            await journals.create({
                body: newUser.toObject(),
                action: 'Création d\'un compte',
                date: new Date()
            });

            return res.status(201).send('Profil enregistré !')
        } catch (error) {
            await journals.create({
                body: {...user.toObject()},
                action: 'Connexion',
                date: new Date()
            });
            return res.status(500).json('Erreur lors de la création de l\'utilisateur')
        }
    }
}

//Connexion utilisateur
const login = async (req, res) => {
    const userObject = req.body;
    const user = await users.findOne({ nom: userObject.nom, prenom: userObject.prenom })

    if (!user) res.status(404).json('Utilisateur non trouvé !');

    try {
        const valid = await bcrypt.compare(userObject.password, user.password);
        if (!valid) return res.status(403).json('Mot de passe incorrect !');

        await journals.create({
            body: {...user.toObject()},
            action: 'Connexion',
            date: new Date()
        });

        const { password, _id, ...restUser } = user.toObject();
        const token = jwt.sign({ id: _id }, 'shhhhh');

        return res.status(200).json({
            user: { ...restUser, id: _id },
            token
        });
    } catch (error) {
        await journals.create({
            body: {error},
            action: 'Connexion',
            date: new Date()
        });
        return res.status(500).json('Erreur serveur');
    }
}

export default { signup, login };
