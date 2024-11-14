const jwt = require('jsonwebtoken');

import bcrypt from 'bcrypt';
import users from '../models/users';
import moment from 'moment';

//Création d'un utilisateur
const signup = async (req, res) => {

    const userObject = req.body;
    const user = await users.findOne({ nom: userObject.nom, prenom: userObject.prenom })
    
    if (user) {
        res.status(401).json('Cet utilisateur est déjà enregistré !')
    }
    else {
        bcrypt.hash(userObject.password, 10)
            .then((hash) => {
                users.create({...userObject, password: hash, nbrDecks: 0, partiesJouees: 0, victoires: 0})
                    .then(() => { res.status(201).send('Profil enregistré !') })
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    }
}

//Connexion utilisateur
const login = async (req, res) => {
    const userObject = req.body;
    const user = await users.findOne({ nom: userObject.nom, prenom: userObject.prenom })

    if (!user) {
        return res.status(404).json('Utilisateur non trouvé !');
    }  

    const restUser = {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        nbrDecks: user.nbrDecks,
        partiesJouees: user.partiesJouees,
        victoires: user.victoires
    }

    bcrypt.compare(userObject.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.status(403).json('Mot de passe incorrect !');
            }
            return res.status(200).json({ user: restUser, token: jwt.sign({ id: user.id }, 'shhhhh', { expiresIn: '1h' }) });
        })
};

export default { signup, login };
