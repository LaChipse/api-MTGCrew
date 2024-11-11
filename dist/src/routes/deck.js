"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Importations
const express = require('express');
const auth_1 = require("../middleware/auth");
const deck_1 = __importDefault(require("../controllers/deck"));
const router = express.Router();
//Routes User
router.get('/mine', auth_1.auth, deck_1.default.getMine);
router.post('/add', deck_1.default.add);
router.delete('/delete', auth_1.auth, deck_1.default.softDelete);
router.put('/update', auth_1.auth, deck_1.default.update);
router.get('/all', deck_1.default.getAll);
//Exportation
exports.default = router;
//# sourceMappingURL=deck.js.map