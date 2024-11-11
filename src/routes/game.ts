//Importations
const express = require('express');
import gameCtrl from '../controllers/game'

const router = express.Router();

//Routes User
router.post('/add', gameCtrl.add);
router.get('/all', gameCtrl.getAll);
router.get('/history', gameCtrl.history);
router.get('/count', gameCtrl.count);

//Exportation
export default router;