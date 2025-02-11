const Teacher = require("../models/teacher");
const SectionClass = require("../models/section-class");
const { removePhoto } = require('../services/photoService');

const teacherController = {

    createTeacher: async (req, res) => {
        try {
            const { department, first_name, middle_name, last_name, sex } = req.body;
            const newTeacher = new Teacher({ department, first_name, middle_name, last_name, sex });
            await newTeacher.save();
            res.status(201).json(newTeacher);
        } catch (error) {
            res.status(500).json({ message: "Error creating teacher", error });
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


    updateTeacherPhoto: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const { id } = req.params;
            const teacher = await Teacher.findById(id);
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }           
            if (teacher.photo) {  //remove old photo
                await removePhoto(teacher.photo);
            }
            teacher.photo = `/uploads/teachers/${req.file.filename}`;
            const updatedTeacher = await teacher.save();

            res.status(200).json(updatedTeacher);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    //remove photo should be added

    deleteTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const teacher = await Teacher.findById(id);
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }
            const teacherExists = await SectionClass.exists({ teacher: id });
            if (teacherExists) {
                return res.status(400).json({
                    message: "Cannot delete the teacher. It is associated with one or more class.",
                });
            }
            if (teacher.photo) {
                await removePhoto(teacher.photo);
            }
            await Teacher.findByIdAndDelete(id);
            res.status(200).json({ message: "Teacher deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

};

module.exports = teacherController;
