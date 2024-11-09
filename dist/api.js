"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const deck_1 = __importDefault(require("./routes/deck"));
// Connect to MongoDB
mongoose_1.default.connect(config_1.config.srv_mongo);
const app = express();
// Middleware pour gérer les requêtes en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'http://localhost:3000', // Remplacez par l'URL de votre client
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization', 'Pragma', 'Source'], // En-têtes autorisés
}));
app.use('/api/auth', auth_1.default);
app.use('/api/user', user_1.default);
app.use('/api/deck', deck_1.default);
exports.default = app;
//# sourceMappingURL=api.js.map