import EventRequest from '../models/EventRequest.js';
// Admin approval/rejection
import Event from '../models/Event.js';

export const createEventRequest = async (req, res) => {
  try {
    const {
      organizerID,
      packageID,
      additionalServices,
      eventName,
      eventLocation,
      eventType,
      eventTime,
      guestCount,
      eventDate,
      remarks
    } = req.body;

    const eventRequest = new EventRequest({
      eventID: `EVT-${Date.now().toString(36)}`,
      organizerID,
      packageID,
      additionalServices,
      eventName,
      eventLocation,
      eventType,
      eventTime,
      guestCount,
      eventDate,
      remarks
    });

    await eventRequest.save();
    res.status(201).json(eventRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event request', error: error.message });
  }
};

// Get all event requests (admin)
export const getAllEventRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const requests = await EventRequest.find(query)
      .populate('packageID')
      .populate('additionalServices.serviceID');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event requests', error });
  }
};

// Get event requests for a specific organizer
export const getRequestsByOrganizer = async (req, res) => {
  try {
    const { organizerID } = req.params;
    const requests = await EventRequest.find({ organizerID })
      .populate('packageID')
      .populate('additionalServices.serviceID');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizer requests', error });
  }
};


// Update an event request (organizer)
export const updateEventRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the request first
    const request = await EventRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only allow editing if it's still pending
    if (request.status !== 'pending') {
      return res.status(403).json({ message: 'Only pending requests can be updated' });
    }

    // Define the allowed fields to update
    const allowedFields = [
      'eventName',
      'eventLocation',
      'eventType',
      'eventTime',
      'guestCount',
      'eventDate',
      'remarks',
      'additionalServices',
      'packageID'
    ];

    // Filter incoming data to only update allowed fields
    const updates = {};
    for (const key of allowedFields) {
      if (key in req.body) {
        updates[key] = req.body[key];
      }
    }

    // Perform update
    const updatedRequest = await EventRequest.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating event request:', error);
    res.status(500).json({ message: 'Error updating event request', error: error.message });
  }
};

// Delete an event request
export const deleteEventRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await EventRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(403).json({ message: 'Only pending requests can be deleted' });
    }

    await EventRequest.findByIdAndDelete(id);
    res.status(200).json({ message: 'Event request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error });
  }
};


export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, rejectionReason } = req.body;

    const request = await EventRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Update only specific fields, rather than the entire document
    // to avoid overwriting required fields like eventTime
    const updateFields = {
      status: status,
      reviewedBy: reviewedBy,
      approvalDate: new Date()
    };
    
    // Add rejection reason if applicable
    if (status === 'rejected' && rejectionReason) {
      updateFields.rejectionReason = rejectionReason;
    }
    
    // Update the document with findByIdAndUpdate to avoid validation issues
    const updatedRequest = await EventRequest.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: false }
    );

    // If approved, create new Event
    if (status === 'approved') {
      const newEvent = new Event({
        organizerID: request.organizerID,
        packageID: request.packageID,
        additionalServices: request.additionalServices,
        eventName: request.eventName,
        eventDate: request.eventDate,
        eventLocation: request.eventLocation,
        eventType: request.eventType,
        eventTime: {
          startDate: request.eventTime.startDate,
          endDate: request.eventTime.endDate
        },
        guestCount: request.guestCount,
        status: 'confirmed',
        approvedBy: reviewedBy,
        // Default: approvedAt will auto-fill
        additionalRequests: request.remarks || ""
      });

      await newEvent.save();
    }

    res.json({ message: 'Request updated successfully' });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: 'Failed to update request', error: err.message });
  }
};