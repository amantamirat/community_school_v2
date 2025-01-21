const Teacher = require("../models/teacher");
//const Department = require("../models/department");
const SectionClass = require("../models/section-class");

const teacherController = {

    createTeacher: async (req, res) => {
        try {
            const { department, first_name, middle_name, last_name, sex } = req.body;
            /*
            // Verify department exists
            const departmentExists = await Department.findById(department);
            if (!departmentExists) {
                return res.status(404).json({ message: "Department not found" });
            }
            */
            const newTeacher = new Teacher({ department, first_name, middle_name, last_name, sex });
            await newTeacher.save();
            res.status(201).json(newTeacher);
        } catch (error) {
            res.status(500).json({ message: "Error creating teacher", error });
        }
    },


    getAllTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find().populate('department');
            res.status(200).json(teachers);
        } catch (error) {
            res.status(500).json({ message: "Error fetching teachers", error });
        }
    },

    getTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find();
            res.status(200).json(teachers);
        } catch (error) {
            res.status(500).json({ message: "Error fetching teachers", error });
        }
    },


    updateTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const { department, first_name, middle_name, last_name, sex } = req.body;
            // Verify department exists if provided
            /*
            if (department) {
                const departmentExists = await Department.findById(department);
                if (!departmentExists) {
                    return res.status(404).json({ message: "Department not found" });
                }
            }
            */
            const updatedTeacher = await Teacher.findByIdAndUpdate(
                id,
                { department, first_name, middle_name, last_name, sex },
                { new: true }
            );

            if (!updatedTeacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }

            res.status(200).json(updatedTeacher);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const teacherExists = await SectionClass.findOne({ teacher: id });
            if (teacherExists) {
                return res.status(400).json({
                    message: "Cannot delete the teacher. It is associated with one or more class.",
                });
            }
            const teacher = await Teacher.findByIdAndDelete(id);
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }
            res.status(200).json({ message: "Teacher deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = teacherController;
