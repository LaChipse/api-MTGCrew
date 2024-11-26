//Importations
const express = require('express');
import gameCtrl from '../controllers/game'

const router = express.Router();

//Routes User
router.post('/add', gameCtrl.add);
router.get('/all/:type', gameCtrl.getAll);
router.get('/history/:type', gameCtrl.history);
router.get('/count/:type', gameCtrl.count);

//Exportation
export default router;