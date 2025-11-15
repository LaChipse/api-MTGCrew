"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Importations
const express = require('express');
const game_1 = __importDefault(require("../controllers/game"));
const auth_1 = require("../middleware/auth");
const router = express.Router();
//Routes User
router.post('/add', auth_1.auth, game_1.default.add);
router.delete('/delete', auth_1.auth, game_1.default.hardDelete);
router.get('/all/:type/:page', game_1.default.getAll);
router.get('/history/:type/:page', game_1.default.history);
router.get('/count/:type', game_1.default.count);
router.get('/historyCount/:type', game_1.default.historyCount);
//Exportation
exports.default = router;
//# sourceMappingURL=game.js.map