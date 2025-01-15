const StudentGrade = require("../models/student-grade");
const studentGradeController = {
    registerExternalStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            console.log(req.body);
            //const { elligible_external_students} = req.body;
            

            //const newStudent = new Student({ first_name, middle_name, last_name, sex, birth_date });
            //await newStudent.save();

            res.status(201).json([]);
        } catch (error) {
            res.status(500).json({ message: "Error registering students", error });
        }
    },
};
module.exports = studentGradeController;