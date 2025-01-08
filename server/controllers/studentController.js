const Student = require("../models/student");

const studentController = {

    createStudent: async (req, res) => {
        try {
            const { first_name, middle_name, last_name, sex, birth_date } = req.body;

            const newStudent = new Student({ first_name, middle_name, last_name, sex, birth_date });
            await newStudent.save();

            res.status(201).json(newStudent);
        } catch (error) {
            res.status(500).json({ message: "Error creating student", error });
        }
    },


    getAllStudents: async (req, res) => {
        try {
            const students = await Student.find();
            res.status(200).json(students);
        } catch (error) {
            res.status(500).json({ message: "Error fetching students", error });
        }
    },


    updateStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const { first_name, middle_name, last_name, sex, birth_date } = req.body;         

            const updatedStudent = await Student.findByIdAndUpdate(
                id,
                {first_name, middle_name, last_name, sex,birth_date},
                { new: true }
            );

            if (!updatedStudent) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.status(200).json(updatedStudent);
        } catch (error) {
            res.status(500).json({ message: "Error updating student", error });
        }
    },

    deleteStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const student = await Student.findByIdAndDelete(id);

            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.status(200).json({ message: "Student deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting student", error });
        }
    }
};

module.exports = studentController;
