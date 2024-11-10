"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../src/config/config");
const auth_1 = __importDefault(require("../src/routes/auth"));
const user_1 = __importDefault(require("../src/routes/user"));
const deck_1 = __importDefault(require("../src/routes/deck"));
// Connect to MongoDB
mongoose_1.default.connect(config_1.config.srv_mongo);
const app = express();
// Middleware pour gérer les requêtes en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: config_1.config.app_url, // Remplacez par l'URL de votre client
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization', 'Pragma', 'Source'], // En-têtes autorisés
}));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch('https://api.ipify.org?format=json');
    const data = yield response.json();
    res.status(200).json({ ip: data.ip });
}));
app.use('/auth', auth_1.default);
app.use('/user', user_1.default);
app.use('/deck', deck_1.default);
exports.default = app;
//# sourceMappingURL=index.js.map