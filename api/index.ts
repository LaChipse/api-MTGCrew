const express = require('express');
const path = require('path');
const cors = require('cors');

import mongoose from 'mongoose';
import { config } from '../src/config/config';

import auth from '../src/routes/auth';
import user from '../src/routes/user'
import deck from '../src/routes/deck'
import game from '../src/routes/game'

// Connect to MongoDB
const connection = mongoose.connect(config.srv_mongo as string);

const app = express();

// Middleware pour gérer les requêtes en JSON
app.use(express.json());
app.use(express.static(path.join('/', 'dist')));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", async (req, res) => {
    res.status(200).send(`Connexion réussie à MongoDB: ${(await connection).Connection.name}`);
});

app.use('/auth', auth);
app.use('/user', user);
app.use('/deck', deck);
app.use('/game', game);

export default app;