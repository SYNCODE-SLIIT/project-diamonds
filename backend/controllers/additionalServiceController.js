import AdditionalService from '../models/AdditionalServices.js';

// Get all Additional Services
export const getAdditionalServices = async (req, res) => {
  try {
    const services = await AdditionalService.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get a single Additional Service by ID
export const getAdditionalServiceById = async (req, res) => {
  try {
    const service = await AdditionalService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Create a new Additional Service
export const createAdditionalService = async (req, res) => {
  try {
    const { serviceID, serviceName, description, price, category, createdBy, status } = req.body;

    // Basic field validation
    if (!serviceID || !serviceName || !description || price === undefined || !category || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newService = new AdditionalService({
      serviceID,
      serviceName,
      description,
      price,
      category,
      createdBy,
      status: status || "available"
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Update an Existing Additional Service
export const updateAdditionalService = async (req, res) => {
  try {
    const { serviceName, description, price, category, status } = req.body;
    const updatedService = await AdditionalService.findByIdAndUpdate(
      req.params.id,
      { serviceName, description, price, category, status },
      { new: true, runValidators: true }
    );
    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Delete an Additional Service
export const deleteAdditionalService = async (req, res) => {
  try {
    const deletedService = await AdditionalService.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
