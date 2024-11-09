const express = require('express');
const cors = require('cors');

import mongoose from 'mongoose';
import { config } from './config/config';

import auth from './routes/auth';
import user from './routes/user'
import deck from './routes/deck'

// Connect to MongoDB

mongoose.connect(config.srv_mongo);

const app = express();

// Middleware pour gérer les requêtes en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: 'http://localhost:5173', // Remplacez par l'URL de votre client
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization', 'Pragma', 'Source'], // En-têtes autorisés
}));

app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/deck', deck);

export default app;

