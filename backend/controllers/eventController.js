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
