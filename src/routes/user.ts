//Importations
const express = require('express');
import userCtrl from '../controllers/user'
import { auth } from '../middleware/auth';

const router = express.Router();

//Routes User
router.get('', auth, userCtrl.getOne);
router.put('/update', auth, userCtrl.update);
router.get('/all', userCtrl.all);
router.get('/usersDecks', userCtrl.getUsersWithDecks)

//Exportation
export default router;