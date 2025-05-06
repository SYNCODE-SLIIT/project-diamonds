import Certificate from '../models/Certificate.js';

export const createCertificate = async (req, res) => {
  try {
    const { recipientName, eventName } = req.body;
    const newCert = new Certificate({ recipientName, eventName });
    await newCert.save();
    res.status(201).json(newCert);
  } catch (err) {
    res.status(500).json({ message: 'Error creating certificate', error: err });
  }
};

export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving certificates', error: err });
  }
};
