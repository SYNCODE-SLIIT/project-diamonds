import { Types } from 'mongoose'; // Import Types to use ObjectId validation
import Assignment from '../models/Assignment.js';
import MemberApplication from '../models/MemberApplication.js';
import EventRequest from '../models/EventRequest.js';

// Assign members to an event
export const assignMembersToEvent = async (req, res) => {
  try {
    const { eventID, memberIDs, assignedBy } = req.body;

    // Ensure eventID is a valid ObjectId
    if (!Types.ObjectId.isValid(eventID)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Fetch approved event
    const event = await EventRequest.findById(eventID);
    if (!event || event.status !== 'approved') {
      return res.status(404).json({ message: 'Event not found or not approved' });
    }

    // Ensure all memberIDs are valid ObjectIds
    const invalidMemberIDs = memberIDs.filter(id => !Types.ObjectId.isValid(id));
    if (invalidMemberIDs.length > 0) {
      return res.status(400).json({ message: `Invalid member ID format: ${invalidMemberIDs}` });
    }

    // Fetch approved members (members whose application status is 'Approved')
    const members = await MemberApplication.find({ '_id': { $in: memberIDs }, 'applicationStatus': 'Approved' });
    if (members.length !== memberIDs.length) {
      return res.status(404).json({ message: 'Some members are not approved or not found' });
    }

    // Create the assignment with memberAssignments (track individual member statuses)
    const assignment = new Assignment({
      eventID,
      memberAssignments: memberIDs.map(memberID => ({
        memberID,
        status: 'pending',  // Default status when initially assigned
        assignedBy,
      })),
    });

    await assignment.save();
    res.status(201).json(assignment); // Return the created assignment
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning members to event', error: error.message });
  }
};
// Get assignments for a specific event
export const getAssignmentsByEvent = async (req, res) => {
  try {
    const { eventID } = req.params;

    // Ensure eventID is a valid ObjectId
    if (!Types.ObjectId.isValid(eventID)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Fetch assignments and populate member data
    const assignments = await Assignment.find({ eventID })
      .populate('memberAssignments.memberID', 'fullName email')  // Populate member information (fullName and email)
      .exec();

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'No members assigned to this event yet.' });
    }

    // Flatten the members from assignments
    const members = assignments.flatMap(assignment => assignment.memberAssignments.map(member => member.memberID));

    res.status(200).json(members); // Return only members (not the full assignment)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};
// Update the status of an assignment (accepted/rejected by member)
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberID, status, reason } = req.body; // Get memberID and status

    // Ensure assignment ID is a valid ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid assignment ID format' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the assignment
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find the specific member in the memberAssignments array
    const memberAssignment = assignment.memberAssignments.find(ma => ma.memberID.toString() === memberID);
    if (!memberAssignment) {
      return res.status(404).json({ message: 'Member not found in this event assignment' });
    }

    // Update the member's status
    memberAssignment.status = status;
    memberAssignment.reason = reason || '';  // Store rejection reason if any

    // If the status is accepted, add the event to the member's calendar
    if (status === 'accepted') {
      const member = await MemberApplication.findById(memberID);
      member.calendar.push({
        eventID: assignment.eventID,
        eventDate: assignment.eventID.eventDate, // Use the event's date
      });
      await member.save();
    }

    await assignment.save(); // Save the updated assignment
    res.status(200).json(assignment); // Return the updated assignment
  } catch (error) {
    res.status(500).json({ message: 'Error updating assignment status', error: error.message });
  }
};

// Get all assignment requests
export const getAssignmentRequests = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('eventID', 'eventName eventDate eventLocation guestCount')
      .populate('memberAssignments.memberID', 'fullName email')
      .exec();

    // Transform the data to a more frontend-friendly format
    const requests = assignments.flatMap(assignment => 
      assignment.memberAssignments.map(ma => ({
        _id: ma._id,
        event: assignment.eventID,
        member: ma.memberID,
        assignedBy: ma.assignedBy,
        status: ma.status,
        createdAt: ma.createdAt
      }))
    );

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching assignment requests:', error);
    res.status(500).json({ message: 'Error fetching assignment requests', error: error.message });
  }
};

// Update request status (accept/reject)
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const assignment = await Assignment.findOne({
      'memberAssignments._id': requestId
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment request not found' });
    }

    const memberAssignment = assignment.memberAssignments.id(requestId);
    if (!memberAssignment) {
      return res.status(404).json({ message: 'Member assignment not found' });
    }

    memberAssignment.status = status;
    await assignment.save();

    res.status(200).json({ message: `Request ${status}ed successfully` });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Error updating request status', error: error.message });
  }
};
