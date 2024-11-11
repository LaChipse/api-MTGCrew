"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Importations
const express = require('express');
const game_1 = __importDefault(require("../controllers/game"));
const router = express.Router();
//Routes User
router.post('/add', game_1.default.add);
//Exportation
exports.default = router;
//# sourceMappingURL=game.js.map