import PracticeRequest from '../models/PracticeRequest.js';
import Practice from '../models/Practice.js';

// Get all practice requests
export const getPracticeRequests = async (req, res) => {
  try {
    console.log('Fetching all practice requests...');
    console.log('Database connection status:', PracticeRequest.db.readyState);
    
    // First, let's check all requests regardless of status
    const allRequests = await PracticeRequest.find();
    console.log('All practice requests in DB:', JSON.stringify(allRequests, null, 2));
    console.log('Total number of requests:', allRequests.length);

    // Now get only pending requests
    const requests = await PracticeRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    console.log('Pending practice requests:', JSON.stringify(requests, null, 2));
    console.log('Number of pending requests:', requests.length);
    
    // Log the query that was used
    console.log('Query used:', { status: 'pending' });
    
    res.json(requests);
  } catch (error) {
    console.error('Error in getPracticeRequests:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// Create a new practice request
export const createPracticeRequest = async (req, res) => {
  try {
    console.log('Creating practice request with data:', req.body);
    const request = new PracticeRequest({
      ...req.body,
      status: 'pending' // Explicitly set status to pending
    });
    console.log('New practice request object:', request);
    
    const savedRequest = await request.save();
    console.log('Saved practice request:', savedRequest);
    
    // Verify the request was saved
    const verifyRequest = await PracticeRequest.findById(savedRequest._id);
    console.log('Verified saved request:', verifyRequest);
    
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error in createPracticeRequest:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update a practice request
export const updatePracticeRequest = async (req, res) => {
  try {
    console.log('Updating practice request:', req.params.id);
    console.log('Update data:', req.body);
    
    const request = await PracticeRequest.findById(req.params.id);
    if (!request) {
      console.log('Practice request not found');
      return res.status(404).json({ message: 'Practice request not found' });
    }

    // Update the request with new data
    Object.assign(request, req.body);
    const updatedRequest = await request.save();
    console.log('Updated practice request:', updatedRequest);

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error in updatePracticeRequest:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a practice request
export const deletePracticeRequest = async (req, res) => {
  try {
    console.log('Deleting practice request:', req.params.id);
    
    const request = await PracticeRequest.findById(req.params.id);
    if (!request) {
      console.log('Practice request not found');
      return res.status(404).json({ message: 'Practice request not found' });
    }

    await PracticeRequest.findByIdAndDelete(req.params.id);
    console.log('Practice request deleted successfully');

    res.json({ message: 'Practice request deleted successfully' });
  } catch (error) {
    console.error('Error in deletePracticeRequest:', error);
    res.status(500).json({ message: error.message });
  }
};

// Accept a practice request
export const acceptPracticeRequest = async (req, res) => {
  try {
    console.log('Accepting practice request:', req.params.id);
    const request = await PracticeRequest.findById(req.params.id);
    if (!request) {
      console.log('Practice request not found');
      return res.status(404).json({ message: 'Practice request not found' });
    }

    // Create a new practice from the request
    const practice = new Practice({
      practiceName: request.practiceName,
      practiceDate: request.practiceDate,
      practiceTime: request.practiceTime,
      practiceLocation: request.practiceLocation,
      duration: request.duration,
      maxParticipants: request.maxParticipants,
      description: request.description
    });

    await practice.save();
    console.log('Created new practice:', practice);

    // Update request status
    request.status = 'accepted';
    await request.save();
    console.log('Updated request status to accepted');

    res.json({ message: 'Practice request accepted and practice created' });
  } catch (error) {
    console.error('Error in acceptPracticeRequest:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject a practice request
export const rejectPracticeRequest = async (req, res) => {
  try {
    console.log('Rejecting practice request:', req.params.id);
    const request = await PracticeRequest.findById(req.params.id);
    if (!request) {
      console.log('Practice request not found');
      return res.status(404).json({ message: 'Practice request not found' });
    }

    request.status = 'rejected';
    await request.save();
    console.log('Updated request status to rejected');

    res.json({ message: 'Practice request rejected' });
  } catch (error) {
    console.error('Error in rejectPracticeRequest:', error);
    res.status(500).json({ message: error.message });
  }
}; 