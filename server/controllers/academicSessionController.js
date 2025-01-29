const AcademicSession = require("../models/academic-session");
const AdmissionClassification = require("../models/admission-classification");


const AcademicSessionController = {
    // Create a new academicSession
    createAcademicSession: async (req, res) => {
        try {
            const { academic_year, start_date, end_date, status } = req.body;
            const newAcademicSession = new AcademicSession({ academic_year, start_date, end_date, status });
            await newAcademicSession.save();
            res.status(201).json(newAcademicSession);
        } catch (error) {
            res.status(500).json({ message: "Error creating academicSession", error });
        }
    },

    // Get all academicSessions
    getAllAcademicSessions: async (req, res) => {
        try {
            const academicSessions = await AcademicSession.find();
            res.status(200).json(academicSessions);
        } catch (error) {
            res.status(500).json({ message: "Error fetching academicSessions", error });
        }
    },

    // Update a academicSession
    updateAcademicSession: async (req, res) => {
        try {
            const { id } = req.params;
            const admissionExists = await AdmissionClassification.exists({ academic_session: id });
            if (admissionExists) {
                return res.status(400).json({
                    message: "Cannot update the Academic Session. It is associated with one or more Classifcation Admission.",
                });
            }
            const { academic_year, start_date, end_date, status } = req.body;
            const updatedAcademicSession = await AcademicSession.findByIdAndUpdate(id, { academic_year, start_date, end_date, status }, { new: true });
            if (!updatedAcademicSession) {
                return res.status(404).json({ message: "Academic Session not found" });
            }

            res.status(200).json(updatedAcademicSession);
        } catch (error) {
            res.status(500).json({ message: "Error updating academicSession", error });
        }
    },

    // Delete a academicSession
    deleteAcademicSession: async (req, res) => {
        try {
            const { id } = req.params;          

            const admissionExists = await AdmissionClassification.exists({ academic_session: id });
            if (admissionExists) {
                return res.status(400).json({
                    message: "Cannot delete the Academic Session. It is associated with one or more Classifcation Admission.",
                });
            }

            const academicSession = await AcademicSession.findByIdAndDelete(id);
            if (!academicSession) {
                return res.status(404).json({ message: "Academic Session not found" });
            }
            res.status(200).json({ message: "Academic Session deleted successfully" });
        } catch (error) {

            res.status(500).json({ message: "Error deleting academicSession", error });
        }
    }
};

module.exports = AcademicSessionController;
