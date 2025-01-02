const Teacher = require("../models/teacher");
const Department = require("../models/department");

const teacherController = {
    // Create a new teacher
    createTeacher: async (req, res) => {
        try {
            const { department, first_name, middle_name, last_name, sex } = req.body;

            // Verify department exists
            const departmentExists = await Department.findById(department);
            if (!departmentExists) {
                return res.status(404).json({ message: "Department not found" });
            }

            const newTeacher = new Teacher({ department, first_name, middle_name, last_name, sex });
            await newTeacher.save();

            // Update department's teachers array
            //departmentExists.teachers.push({ teacher: newTeacher._id });
            await departmentExists.save();
            res.status(201).json(newTeacher);
        } catch (error) {
            res.status(500).json({ message: "Error creating teacher", error });
        }
    },

    // Get all teachers
    getAllTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find();
            res.status(200).json(teachers);
        } catch (error) {
            res.status(500).json({ message: "Error fetching teachers", error });
        }
    },

    // Update teacher information
    updateTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const { department, first_name, middle_name, last_name, sex } = req.body;

            // Verify department exists if provided
            if (department) {
                const departmentExists = await Department.findById(department);
                if (!departmentExists) {
                    return res.status(404).json({ message: "Department not found" });
                }
            }

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
            res.status(500).json({ message: "Error updating teacher", error });
        }
    },

    // Delete a teacher
    deleteTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const teacher = await Teacher.findByIdAndDelete(id);

            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }

            res.status(200).json({ message: "Teacher deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting teacher", error });
        }
    }
};

module.exports = teacherController;
