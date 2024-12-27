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
            departmentExists.teachers.push({ teacher: newTeacher._id });
            await departmentExists.save();
            res.status(201).json(newTeacher);
        } catch (error) {
            res.status(500).json({ message: "Error creating teacher", error });
        }
    },

    // Get all teachers
    getAllTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find().populate("department");
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

            const teacher = await Teacher.findById(id);
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }

            // If the department is updated
            if (department && department !== teacher.department.toString()) {
                const oldDepartment = await Department.findById(teacher.department);
                const newDepartment = await Department.findById(department);

                if (!newDepartment) {
                    return res.status(404).json({ message: "New department not found" });
                }

                // Remove teacher from old department
                if (oldDepartment) {
                    oldDepartment.teachers = oldDepartment.teachers.filter(
                        t => t.teacher.toString() !== id
                    );
                    await oldDepartment.save();
                }

                // Add teacher to new department
                newDepartment.teachers.push({ teacher: id });
                await newDepartment.save();
            }

            // Update teacher details
            teacher.department = department || teacher.department;
            teacher.first_name = first_name || teacher.first_name;
            teacher.middle_name = middle_name || teacher.middle_name;
            teacher.last_name = last_name || teacher.last_name;
            teacher.sex = sex || teacher.sex;
            await teacher.save();

            res.status(200).json(teacher);
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

            // Remove teacher from department's teachers array
            const department = await Department.findById(teacher.department);
            if (department) {
                department.teachers = department.teachers.filter(
                    t => t.teacher.toString() !== id
                );
                await department.save();
            }

            res.status(200).json({ message: "Teacher deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting teacher", error });
        }
    }
};

module.exports = teacherController;
