import Collaboration from '../models/Collaboration.js';

export const addCollaborator = async (req, res) => {
  try {
    const collaborator = new Collaboration(req.body);
    await collaborator.save();
    res.status(201).json(collaborator);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCollaborators = async (req, res) => {
  try {
    const collaborators = await Collaboration.find();
    res.json(collaborators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCollaborator = async (req, res) => {
  try {
    const updated = await Collaboration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Collaborator not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCollaborator = async (req, res) => {
  try {
    await Collaboration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Collaborator removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
