//Importations
const express = require('express');
import gameCtrl from '../controllers/game'

const router = express.Router();

//Routes User
router.post('/add', gameCtrl.add);
router.delete('/delete', gameCtrl.hardDelete);
router.get('/all/:type/:page', gameCtrl.getAll);
router.get('/history/:type/:page', gameCtrl.history);
router.get('/count/:type', gameCtrl.count);
router.get('/historyCount/:type', gameCtrl.historyCount);

//Exportation
export default router;