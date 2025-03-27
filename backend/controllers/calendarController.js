import CalendarEvent from '../models/CalendarEvent.js';
import User from '../models/User.js';

export const addEvent = async (req, res) => {
    try {
        const { title, description, date, time, location, eventType, createdBy, teamMembers } = req.body;

        // Ensure that createdBy is a valid team manager
        // const creator = await User.findById(createdBy);
        // if (!creator || creator.role !== 'teamManager') {
        //     return res.status(400).json({ message: "Invalid team manager" });
        // }

        // // Validate team members (ensure all team members exist and are of type 'member')
        // const validMembers = await User.find({ '_id': { $in: teamMembers }, role: 'member' });
        // if (validMembers.length !== teamMembers.length) {
        //     return res.status(400).json({ message: "Some users are not valid members" });
        // }

        const newEvent = new CalendarEvent({
            title,
            description,
            date,
            time,
            location,
            eventType,
            createdBy,
            teamMembers  // Added team members to the event
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event added successfully', event: newEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.find().populate('createdBy', 'fullName email').populate('teamMembers', 'fullName email');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getEventsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const events = await CalendarEvent.find({ date }).populate('createdBy', 'fullName email').populate('teamMembers', 'fullName email');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await CalendarEvent.findByIdAndDelete(id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
