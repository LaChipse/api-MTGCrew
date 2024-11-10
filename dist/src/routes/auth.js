"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Importations
const express = require('express');
const auth_1 = __importDefault(require("../controllers/auth"));
const router = express.Router();
//Routes User
router.post('/signup', auth_1.default.signup);
router.post('/login', auth_1.default.login);
router.get('/test', auth_1.default.test);
//Exportation
exports.default = router;
//# sourceMappingURL=auth.js.map