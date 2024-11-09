//Importations
const express = require('express');
import { auth } from '../middleware/auth';
import deckCtrl from '../controllers/deck'

const router = express.Router();

//Routes User
router.get('/all', auth, deckCtrl.getAll);
router.post('/add', deckCtrl.add);
router.delete('/delete', auth, deckCtrl.softDelete);
router.put('/update', auth, deckCtrl.update);

//Exportation
export default router;