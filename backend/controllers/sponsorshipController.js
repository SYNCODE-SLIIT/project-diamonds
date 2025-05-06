import Sponsorship from '../models/Sponsorship.js';

export const createSponsorship = async (req, res) => {
  try {
    const sponsorship = new Sponsorship(req.body);
    await sponsorship.save();
    res.status(201).json(sponsorship);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getSponsorships = async (req, res) => {
  try {
    const data = await Sponsorship.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSponsorship = async (req, res) => {
  try {
    const updated = await Sponsorship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteSponsorship = async (req, res) => {
  try {
    await Sponsorship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
