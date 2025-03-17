export const validateMemberApplication = (req, res, next) => {
    const { age } = req.body;
    if (age < 18) {
      return res.status(400).json({ message: 'Applicants must be at least 18 years old.' });
    }
    next();
  };