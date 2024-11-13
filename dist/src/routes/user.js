"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Importations
const express = require('express');
const user_1 = __importDefault(require("../controllers/user"));
const auth_1 = require("../middleware/auth");
const router = express.Router();
//Routes User
router.get('', auth_1.auth, user_1.default.getOne);
router.put('/update', auth_1.auth, user_1.default.update);
router.get('/all', user_1.default.all);
router.get('/usersDecks', user_1.default.getUsersWithDecks);
//Exportation
exports.default = router;
//# sourceMappingURL=user.js.map