//Importations
const express = require('express');
import gameCtrl from '../controllers/game'

const router = express.Router();

//Routes User
router.post('/add', gameCtrl.add);
router.get('/all', gameCtrl.getAll);

//Exportation
export default router;