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
const path = require('path');
const cors = require('cors');
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../src/config/config");
const auth_1 = __importDefault(require("../src/routes/auth"));
const user_1 = __importDefault(require("../src/routes/user"));
const deck_1 = __importDefault(require("../src/routes/deck"));
const game_1 = __importDefault(require("../src/routes/game"));
// Connect to MongoDB
const connection = mongoose_1.default.connect(config_1.config.srv_mongo);
const app = express();
// Middleware pour gérer les requêtes en JSON
app.use(express.json());
// Servir les fichiers statiques du dossier 'dist'
app.use(express.static(path.join('/', 'dist')));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(`Connexion réussie à MongoDB: ${(yield connection).Connection.name}`);
}));
app.use('/auth', auth_1.default);
app.use('/user', user_1.default);
app.use('/deck', deck_1.default);
app.use('/game', game_1.default);
exports.default = app;
//# sourceMappingURL=index.js.map