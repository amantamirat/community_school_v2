const Subject = require("../models/subject");
const GradeSubject = require('../models/grade-subject');

// Controller functions
const subjectController = {
    // Create a new subject
    createSubject: async (req, res) => {
        try {
            const { title, load } = req.body;
            const newSubject = new Subject({ title, load });
            await newSubject.save();
            res.status(201).json(newSubject);
        } catch (error) {
            res.status(500).json({ message: "Error creating subject", error });
        }
    },

    // Get all subjects
    getAllSubjects: async (req, res) => {
        try {
            //console.log("request for subject");
            const subjects = await Subject.find();
            res.status(200).json(subjects);
        } catch (error) {
            res.status(500).json({ message: "Error fetching subjects", error });
        }
    },

    // Update a subject
    updateSubject: async (req, res) => {
        try {
            const { id } = req.params;
            const isReferenced = await GradeSubject.findOne({ 'subject': id });
            if (isReferenced) {
                return res.status(400).json({
                    message: "Cannot update subject as it is referenced in a curriculum.",
                });
            }
            const { title, load } = req.body;
            const updatedSubject = await Subject.findByIdAndUpdate(id, { title, load }, { new: true });
            if (!updatedSubject) {
                return res.status(404).json({ message: "Subject not found" });
            }
            res.status(200).json(updatedSubject);
        } catch (error) {
            res.status(500).json({ message: "Error updating subject", error });
        }
    },

    // Delete a subject
    deleteSubject: async (req, res) => {
        try {
            const { id } = req.params;
            const isReferenced = await GradeSubject.exists({ subject: id });
            if (isReferenced) {
                return res.status(400).json({
                    message: "Cannot delete subject as it is referenced in a curriculum.",
                });
            }
            const subject = await Subject.findByIdAndDelete(id);
            if (!subject) {
                return res.status(404).json({ message: "Subject not found" });
            }
            res.status(200).json({ message: "Subject deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting subject", error });
        }
    }
};

module.exports = subjectController;
