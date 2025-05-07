import Collaboration from '../models/Collaboration.js';
import xlsx from 'xlsx';

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

export const downloadCollaboratorsReport = async (req, res) => {
  try {
    const collaborators = await Collaboration.find().lean();
    const data = collaborators.map(item => ({
      Name: item.name,
      Role: item.role,
      AccessDuration: item.accessDuration,
      Status: item.status,
      ProfileImage: item.profileImage,
      CreatedAt: new Date(item.createdAt).toLocaleDateString(),
      UpdatedAt: new Date(item.updatedAt).toLocaleDateString(),
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Collaborators');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=Collaborators_Report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating collaborators report:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
