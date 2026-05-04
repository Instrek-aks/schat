const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Route to send a message
router.post('/send', chatController.sendMessage);

// Route to get conversation between two users
router.get('/history/:userId/:otherId', chatController.getMessages);

module.exports = router;
