const express = require('express');
const cors = require('cors');

import mongoose from 'mongoose';
import { config } from '../src/config/config';

import auth from '../src/routes/auth';
import user from '../src/routes/user'
import deck from '../src/routes/deck'

// Connect to MongoDB
mongoose.connect(config.srv_mongo as string);

const app = express();

// Middleware pour gérer les requêtes en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: config.app_url, // Remplacez par l'URL de votre client
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization', 'Pragma', 'Source'], // En-têtes autorisés
}));

app.use('/auth', auth);
app.use('/user', user);
app.use('/deck', deck);

export default app;