// eventRoutes.js
import express from 'express';
import EventRequest from '../models/EventRequest.js';
import Event from '../models/Event.js';
import { updateEventDetails } from '../controllers/eventController.js';

const router = express.Router();

// Route to get approved events
router.get('/approved', async (req, res) => {
  try {
    // Fetch events with the status 'approved'
    const approvedEvents = await EventRequest.find({ status: 'approved' });
    res.status(200).json(approvedEvents); // Return approved events as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching approved events', error: error.message });
  }
});

// Route to add a note to an event
router.post('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, content } = req.body;
    
    if (!author || !content) {
      return res.status(400).json({ message: 'Author and content are required' });
    }
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const newNote = {
      author,
      content,
      createdAt: new Date()
    };
    
    event.notes.push(newNote);
    await event.save();
    
    res.status(201).json({ 
      message: 'Note added successfully',
      note: newNote,
      allNotes: event.notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding note to event', error: error.message });
  }
});

// Route to update a note
router.put('/:id/notes/:noteIndex', async (req, res) => {
  try {
    const { id, noteIndex } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.notes[noteIndex]) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Update the content but keep the original author and add updatedAt timestamp
    event.notes[noteIndex].content = content;
    event.notes[noteIndex].updatedAt = new Date();
    
    await event.save();
    
    res.status(200).json({ 
      message: 'Note updated successfully',
      note: event.notes[noteIndex],
      allNotes: event.notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// Route to delete a note
router.delete('/:id/notes/:noteIndex', async (req, res) => {
  try {
    const { id, noteIndex } = req.params;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.notes[noteIndex]) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Remove the note at the specified index
    event.notes.splice(noteIndex, 1);
    await event.save();
    
    res.status(200).json({ 
      message: 'Note deleted successfully',
      allNotes: event.notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// Route to update event details
router.put('/:id', updateEventDetails);

export default router;