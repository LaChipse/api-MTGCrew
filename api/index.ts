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


app.get("/", async (req, res) => {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json() as any;
    res.status(200).json({ ip: data.ip });
});
app.use('/auth', auth);
app.use('/user', user);
app.use('/deck', deck);

export default app;