//Importations
const express = require('express');
import authCtrl from '../controllers/auth'

const router = express.Router();

//Routes User
router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);

//Exportation
export default router;