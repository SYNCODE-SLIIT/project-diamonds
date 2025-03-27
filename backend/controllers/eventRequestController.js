import EventRequest from '../models/EventRequest.js';

export const createEventRequest = async (req, res) => {
  try {
    const {
      organizerID,
      packageID,
      additionalServices,
      eventName,
      eventLocation,
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
    const request = await EventRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(403).json({ message: 'Only pending requests can be updated' });
    }

    const updated = await EventRequest.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event request', error });
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

// Admin approval/rejection
import Event from '../models/event.js';

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, rejectionReason } = req.body;

    const request = await EventRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    request.reviewedBy = reviewedBy;
    request.approvalDate = new Date();
    await request.save();

    if (status === 'approved') {
      const newEvent = new Event({
        organizerID: request.organizerID,
        packageID: request.packageID,
        additionalServices: request.additionalServices,
        eventName: request.eventName,
        eventDate: request.eventDate,
        eventLocation: request.eventLocation,
        guestCount: request.guestCount,
        approvedBy: reviewedBy
      });
      await newEvent.save();
    }

    res.json({ message: 'Request updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update request', error: err.message });
  }
};