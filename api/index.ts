const express = require('express');
const path = require('path');
const cors = require('cors');

import mongoose from 'mongoose';
import { config } from '../src/config/config';

import auth from '../src/routes/auth';
import user from '../src/routes/user'
import deck from '../src/routes/deck'

// Connect to MongoDB
const connection = mongoose.connect(config.srv_mongo as string);

const app = express();

// Middleware pour gérer les requêtes en JSON
app.use(express.json());
// Servir les fichiers statiques du dossier 'dist'
app.use(express.static(path.join('/', 'dist')));
app.use('/manifest.webmanifest', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(path.resolve('/', 'manifest.webmanifest'));
});
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.get("/", async (req, res) => {
    res.status(200).send(`Connexion réussie à MongoDB: ${(await connection).Connection.name}`);
});
app.use('/auth', auth);
app.use('/user', user);
app.use('/deck', deck);

export default app;