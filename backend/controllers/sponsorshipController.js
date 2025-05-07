import Sponsorship from '../models/Sponsorship.js';
import xlsx from 'xlsx';

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

export const downloadSponsorshipReport = async (req, res) => {
  try {
    const sponsorships = await Sponsorship.find().lean();
    const data = sponsorships.map(item => ({
      SponsorName: item.sponsorName,
      SponsorType: item.sponsorType,
      ContributionDetails: item.contributionDetails,
      Category: item.category,
      Duration: item.duration,
      ContactPerson: item.contactPerson,
      ContactInfo: item.contactInfo,
      Status: item.status,
      CreatedAt: new Date(item.createdAt).toLocaleDateString(),
      UpdatedAt: new Date(item.updatedAt).toLocaleDateString(),
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Sponsorships');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=Sponsorships_Report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating sponsorship report:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
