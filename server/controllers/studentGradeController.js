const StudentGrade = require("../models/student-grade");
const ExternalStudentPriorInfo = require('../models/external-student-info');
const ClassificationGrade = require('../models/classification-grade');
const Student = require("../models/student");
const GradeSection = require('../models/grade-sections');
const { registerStudentClasses, removeStudentClasses } = require('../services/studentClassService');
const { getPreviousGrade } = require('../services/gradeService');
const CurriculumGrade = require("../models/curriculum-grade");




const studentGradeController = {

    getSectionedRegisteredStudents: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const registered_students = await StudentGrade.find({ grade_section: grade_section }).populate('student').populate('grade_section');
            res.status(200).json(registered_students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUnSectionedRegisteredStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const registered_students = await StudentGrade.find({
                classification_grade: classification_grade,
                grade_section: { $exists: false },
            })
                .populate('student');
            res.status(200).json(registered_students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getElligibleStudentsByGrade: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'admission_classification', populate: { path: 'academic_session', },
            }).populate({
                path: 'curriculum_grade', populate: { path: 'grade', },
            });
            if (!classificationGrade) {
                return res.status(404).json({ message: "Class Grade not found" });
            }
            if (classificationGrade.status === 'CLOSED') return res.status(404).json({ message: 'Can not find students, Grade is CLOSED' });
            const grade = classificationGrade.curriculum_grade.grade;
            const academic_year = classificationGrade.admission_classification.academic_session.academic_year;
            const previousGrade = await getPreviousGrade(grade);
            if (previousGrade === null) return res.status(404).json({ message: 'KG-1 Grade Found.' });

            const curriculumGradeIds = await CurriculumGrade.find({ grade: previousGrade._id }).distinct('_id');
            const classificationGradeIds = await ClassificationGrade.find({ curriculum_grade: { $in: curriculumGradeIds }, status: 'CLOSED' }).distinct('_id')
            const passedStudents = await StudentGrade.find({
                classification_grade: { $in: classificationGradeIds },
                status: "PASSED", registered: false,
            }).populate('student');
            res.status(200).json(passedStudents);
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
    },

    registerStudents: async (req, res) => {
        try {
            const candidate_students = req.body;
            if (!Array.isArray(candidate_students)) return res.status(404).json({ message: "Non array students provided." });
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            if (!classificationGrade) return res.status(404).json({ message: "Classification Grade not found" });
            if (classificationGrade.status === 'CLOSED') return res.status(404).json({ message: 'Can not register students, Grade is CLOSED' });

            const studentGrades = await StudentGrade.find({ _id: { $in: candidate_students } }).lean();
            if (candidate_students.length !== studentGrades.length) return res.status(404).json({ message: "No valid student information found." });
            const student_grades = [];
            for (const student of studentGrades) {
                student_grades.push({
                    student: student.student,
                    classification_grade: classificationGrade._id,
                    previous_student_grade: student._id
                });
            }
            if (!student_grades.length) return res.status(400).json({ message: "No students eligible for registration." });
            await Promise.all([
                StudentGrade.insertMany(student_grades),
                StudentGrade.updateMany({ _id: { $in: candidate_students } },
                    { $set: { registered: true } })
            ]);
            res.status(201).json(candidate_students);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error registering students" + error });
        }
    },

    deregisterStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const selected_registered_students = req.body;

            if (!Array.isArray(selected_registered_students) || selected_registered_students.length === 0) {
                return res.status(400).json({ message: "Array of students required for deregistration." });
            }

            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) {
                return res.status(404).json({ message: "Grade not found." });
            }

            // Fetch registered students in one query
            const registeredStudents = await StudentGrade.find({
                _id: { $in: selected_registered_students },
                classification_grade: classification_grade,
                grade_section: { $exists: false }
            });

            if (registeredStudents.length !== selected_registered_students.length) {
                return res.status(404).json({ message: "Some students are invalid or not found." });
            }

            // Separate students into categories
            const external_students_info = [];
            const dereg_new_students = [];
            const prev_students = [];
            registeredStudents.forEach((regStudent) => {
                if (regStudent.external_student_prior_info) {
                    external_students_info.push(regStudent.external_student_prior_info);
                } else if (regStudent.previous_student_grade) {
                    prev_students.push(regStudent.previous_student_grade);
                } else {
                    dereg_new_students.push(regStudent.student);
                }
            });

            // Execute all database operations in parallel
            await Promise.all([
                StudentGrade.deleteMany({ _id: { $in: selected_registered_students } }),
                external_students_info.length > 0
                    ? ExternalStudentPriorInfo.updateMany(
                        { _id: { $in: external_students_info } },
                        { $set: { registered: false } }
                    )
                    : Promise.resolve(),
                prev_students.length > 0
                    ? StudentGrade.updateMany(
                        { _id: { $in: prev_students } },
                        { $set: { registered: false } }
                    )
                    : Promise.resolve(),
                dereg_new_students.length > 0
                    ? Student.updateMany(
                        { _id: { $in: dereg_new_students } },
                        { $set: { registered: false } }
                    )
                    : Promise.resolve()
            ]);

            res.status(200).json({ message: "Students successfully deregistered." });
        } catch (error) {
            console.error("Error deregistering students:", error);
            res.status(500).json({ message: "Error deregistering students: " + error.message });
        }
    },
    //allocation of section
    allocateSection: async (req, res) => {
        try {
            const selected_students = req.body;
            if (!Array.isArray(selected_students) || selected_students.length === 0) {
                return res.status(400).json({ message: "Invalid request: An array of student IDs is required." });
            }
            const { grade_section } = req.params;
            const gradeSection = await GradeSection.findById(grade_section).lean();
            if (!gradeSection) {
                return res.status(404).json({ message: "Grade Section not found." });
            }
            if (gradeSection.status === 'CLOSED') {
                return res.status(400).json({ message: "Cannot attach students, section is CLOSED." });
            }
            const currentAllocated = await StudentGrade.countDocuments({ grade_section: gradeSection._id });
            if (currentAllocated + selected_students.length > gradeSection.number_of_seat) {
                return res.status(400).json({ message: "Allocation exceeds the section's capacity." });
            }
            const registeredStudents = await StudentGrade.find({
                _id: { $in: selected_students },
                classification_grade: gradeSection.classification_grade,
                grade_section: { $exists: false }
            }).lean();

            if (registeredStudents.length !== selected_students.length) {
                return res.status(400).json({ message: "Some provided student IDs are invalid or already assigned to a section." });
            }
            await registerStudentClasses(gradeSection, registeredStudents);
            const result = await StudentGrade.updateMany(
                { _id: { $in: selected_students } },
                { $set: { grade_section: gradeSection._id } }
            );
            res.status(200).json(result);
        } catch (error) {
            console.error("Error in allocateSection:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },

    detachSection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const selected_students = req.body;
            if (!Array.isArray(selected_students) || selected_students.length === 0) {
                return res.status(400).json({ message: "Error: An array of student IDs is required." });
            }
            const gradeSection = await GradeSection.findById(grade_section);
            if (!gradeSection) {
                return res.status(404).json({ message: "Grade Section not found" });
            }
            if (gradeSection.status === 'CLOSED') return res.status(404).json({ message: 'Can not detach students, Section is CLOSED' });

            const studentGrades = await StudentGrade.find({ _id: { $in: selected_students } }).lean();
            if (studentGrades.length !== selected_students.length) return res.status(400).json({ message: "Some provided student IDs are invalid." });
            const invalidSectionStudent = studentGrades.some(student => !student.grade_section?.equals(grade_section));
            if (invalidSectionStudent) return res.status(400).json({ message: `Some students are not in the correct section.` });

            await removeStudentClasses(selected_students);
            const result = await StudentGrade.updateMany({ _id: { $in: selected_students } }, { $unset: { grade_section: 1 } });
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },



};
module.exports = studentGradeController;