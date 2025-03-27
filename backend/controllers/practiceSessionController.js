import PracticeSession from '../models/PracticeSession.js';
import MemberApplication from '../models/MemberApplication.js';

export const createPracticeSession = async (req, res) => {
  const { sessionDate, location, description } = req.body;
  try {
    const newSession = new PracticeSession({ sessionDate, location, description });
    await newSession.save();
    res.status(200).json({ message: 'Practice session created successfully', session: newSession });
  } catch (error) {
    res.status(500).json({ message: 'Error creating practice session', error });
  }
};

export const assignMemberToPracticeSession = async (req, res) => {
  const { sessionId, memberId } = req.body;
  try {
    const session = await PracticeSession.findById(sessionId);
    const member = await MemberApplication.findById(memberId);

    if (!session || !member) {
      return res.status(404).json({ message: 'Session or Member not found' });
    }

    session.membersAssigned.push({ memberId, status: 'Pending' });
    await session.save();

    // Notify the member
    console.log(`Member ${member.fullName} has been requested to join the practice session`);

    res.status(200).json({ message: 'Member assignment request for practice session sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
