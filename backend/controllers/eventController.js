import Event from '../models/Event.js';
import MemberApplication from '../models/MemberApplication.js';

// Assign member to event
export const assignMemberToEvent = async (req, res) => {
  const { eventId, memberId } = req.body;
  try {
    const event = await Event.findById(eventId);
    const member = await MemberApplication.findById(memberId);
    
    if (!event || !member) {
      return res.status(404).json({ message: 'Event or Member not found' });
    }

    // Create a request to assign member
    event.membersAssigned.push({ memberId, status: 'Pending' });
    await event.save();
    
    // Notify the member (for simplicity, just logging for now)
    console.log(`Member ${member.fullName} has been requested to join the event: ${event.eventName}`);

    res.status(200).json({ message: 'Member assignment request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update event details
export const updateEventDetails = async (req, res) => {
  const { id } = req.params;
  const { 
    eventName, 
    eventType,
    eventLocation,
    eventDate,
    eventTime,
    guestCount,
    additionalRequests 
  } = req.body;

  try {
    // Input validation
    if (eventName && eventName.length < 2) {
      return res.status(400).json({ message: 'Event name must be at least 2 characters.' });
    }

    if (eventLocation && eventLocation.length < 2) {
      return res.status(400).json({ message: 'Event location must be at least 2 characters.' });
    }

    if (guestCount && (isNaN(guestCount) || parseInt(guestCount) <= 0)) {
      return res.status(400).json({ message: 'Guest count must be a positive number.' });
    }

    // Date validation
    if (eventDate) {
      const currentDate = new Date().setHours(0, 0, 0, 0);
      const selectedDate = new Date(eventDate).setHours(0, 0, 0, 0);
      
      if (selectedDate < currentDate) {
        return res.status(400).json({ message: 'Event date cannot be in the past.' });
      }
    }

    // Time validation
    if (eventTime && eventTime.startDate && eventTime.endDate) {
      const startDateTime = new Date(eventTime.startDate);
      const endDateTime = new Date(eventTime.endDate);
      
      if (endDateTime <= startDateTime) {
        return res.status(400).json({ message: 'End time must be after start time.' });
      }

      // Check if start time is in the past for today's events
      const now = new Date();
      const todayDate = now.setHours(0, 0, 0, 0);
      const eventDateObj = new Date(eventDate).setHours(0, 0, 0, 0);
      
      if (eventDateObj === todayDate && startDateTime < now) {
        return res.status(400).json({ message: 'Start time cannot be in the past for today\'s event.' });
      }
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update fields only if provided
    if (eventName) event.eventName = eventName;
    if (eventType) event.eventType = eventType;
    if (eventLocation) event.eventLocation = eventLocation;
    if (eventDate) event.eventDate = eventDate;
    if (eventTime) event.eventTime = eventTime;
    if (guestCount) event.guestCount = parseInt(guestCount);
    if (additionalRequests !== undefined) event.additionalRequests = additionalRequests;

    await event.save();

    res.status(200).json({ 
      success: true, 
      message: 'Event details updated successfully',
      event
    });
  } catch (error) {
    console.error('Error updating event details:', error);
    res.status(500).json({ success: false, message: 'Failed to update event details', error: error.message });
  }
};
