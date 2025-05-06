import Practice from '../models/Practice.js';

// Get all practices
export const getAllPractices = async (req, res) => {
  try {
    const practices = await Practice.find().sort({ practiceDate: 1 });
    res.json(practices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new practice
export const createPractice = async (req, res) => {
  try {
    const practice = new Practice(req.body);
    const savedPractice = await practice.save();
    res.status(201).json(savedPractice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get practice assignments
export const getPracticeAssignments = async (req, res) => {
  try {
    const practice = await Practice.findById(req.params.id)
      .populate('assignedMembers.memberID', 'fullName email');
    
    if (!practice) {
      return res.status(404).json({ message: 'Practice not found' });
    }
    
    res.json(practice.assignedMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign members to practice
export const assignMembers = async (req, res) => {
  try {
    const { practiceID, memberIDs, assignedBy } = req.body;
    
    const practice = await Practice.findById(practiceID);
    if (!practice) {
      return res.status(404).json({ message: 'Practice not found' });
    }

    // Add new assignments
    const newAssignments = memberIDs.map(memberID => ({
      memberID,
      assignedBy
    }));

    practice.assignedMembers.push(...newAssignments);
    await practice.save();

    res.json({ message: 'Members assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 