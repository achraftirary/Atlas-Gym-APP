const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.post('/login', memberController.login);
router.post('/register', memberController.register);

// Protected member routes
router.get('/profile', auth, memberController.getProfile);
router.put('/profile', auth, memberController.updateProfile);

// Protected admin routes
router.get('/', adminAuth, memberController.getAllMembers);
router.post('/', adminAuth, memberController.createMember);
router.get('/:id', adminAuth, memberController.getMember);
router.put('/:id', adminAuth, memberController.updateMember);
router.delete('/:id', adminAuth, memberController.deleteMember);

module.exports = router; 