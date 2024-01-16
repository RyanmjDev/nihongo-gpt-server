const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../utils/auth');


// Chat routes
// Get all messages
router.get('/', auth, chatController.getMessages)

// Post a message
router.post('/', auth, chatController.postMessage);

// Delete All Messages
router.delete('/', auth, chatController.deleteAllMessages);


// Notes routes. Currently not active in the frontend
// Get all notes
router.get('/notes', auth, chatController.getNotes);

// Save a note
router.post( '/notes', auth, chatController.saveNote);

// delete a note
router.delete('/notes/:noteId', auth, chatController.deleteNote);


module.exports = router;
