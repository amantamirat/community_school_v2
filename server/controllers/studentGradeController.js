const StudentGrade = require("../models/student-grade");
const ExternalStudentPriorInfo = require('../models/external-student-info');
const ClassificationGrade = require('../models/classification-grade');
const Student = require("../models/student");
const GradeSection = require('../models/grade-sections');
const StudentResult = require("../models/student-result");
const gradeController = require('../controllers/gradeController');
const GradeSubject = require('../models/grade-subject');
const SubjectTerm = require('../models/subject-term');
const StudentClass = require('../models/student-class');
const SectionClass = require("../models/section-class");




const registerStudentClasses = async (grade_section, sectionStudents) => {
    const sectionTermClasses = await SectionClass.find(
        { grade_section: grade_section },
        { _id: 1 }
    ).lean();
    const newStudentTermClasses = sectionStudents.flatMap(secStud =>
        sectionTermClasses.map(secTerm => ({
            student_grade: secStud,
            section_class: secTerm._id
        }))
    );
    return await StudentClass.insertMany(newStudentTermClasses);
};

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

    registerExternalStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            if (!classificationGrade) {
                throw new Error("Classification Grade not found");
            }
            const current_grade = classificationGrade.curriculum_grade.grade;
            const prev_grade = await gradeController.getPreviousGrade(current_grade);
            if (!prev_grade) {
                return res.status(404).json({ message: 'Previous Grade not found, for ' + current_grade.stage + '-' + current_grade.level });
            }
            const candidate_external_students = req.body;
            const student_grades = [];
            const external_students_info = [];
            if (Array.isArray(candidate_external_students)) {
                for (const cadidate of candidate_external_students) {
                    const externalInfo = await ExternalStudentPriorInfo.findById(cadidate);
                    if (!externalInfo) {
                        return res.status(404).json({ message: "Non External Student Information Found (Invalid Data)." });
                    }
                    if (externalInfo.status === 'PASSED') {
                        if (!externalInfo.grade.equals(prev_grade._id)) {
                            continue;
                        }
                    } else if (externalInfo.status === 'FAILED') {
                        if (!externalInfo.grade.equals(current_grade._id)) {
                            continue;
                        }
                    } else {
                        continue;
                    }
                    const student_grade = new StudentGrade({
                        classification_grade: classificationGrade._id,
                        student: externalInfo.student,
                        external_student_prior_info: externalInfo._id
                    });
                    student_grades.push(student_grade);
                    external_students_info.push(externalInfo._id);
                }
            } else {
                res.status(404).json({ message: "Data protocol error, no array students found. Error for registering students" });
            }
            const savedStudentGrades = await StudentGrade.insertMany(student_grades);
            await ExternalStudentPriorInfo.updateMany(
                { _id: { $in: external_students_info } },
                { $set: { is_referred: true } }
            );
            res.status(201).json(savedStudentGrades);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: "Error registering students" + error });
        }
    },

    registerFirstLevelStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade).populate({
                path: 'curriculum_grade',
                populate: { path: 'grade', },
            });
            if (!classificationGrade) {
                return res.status(404).json({ message: "Classification Grade not found" });
            }
            const current_grade = classificationGrade.curriculum_grade.grade;
            if (current_grade.level !== 1) {
                return res.status(404).json({ message: 'Non First Level Grade Provided.' });
            }
            const candidate_students = req.body;
            if (!Array.isArray(candidate_students)) {
                res.status(404).json({ message: "Non array students provided." });
            }
            const student_grades = [];
            const reg_students = [];
            for (const cadidate of candidate_students) {
                const student = await Student.findById(cadidate);
                if (!student) {
                    return res.status(404).json({ message: "Non Student Information Found." });
                }
                if (student.has_perior_school_info | student.registered) {
                    continue;
                }
                const student_grade = new StudentGrade({
                    student: student._id,
                    classification_grade: classificationGrade._id
                });
                student_grades.push(student_grade);
                reg_students.push(cadidate);
            }

            const savedStudentGrades = await StudentGrade.insertMany(student_grades);
            await Student.updateMany(
                { _id: { $in: reg_students } },
                { $set: { registered: true } }
            );
            res.status(201).json(savedStudentGrades);
        } catch (error) {
            res.status(500).json({ message: "Error registering students" + error });
        }
    },

    deregisterStudents: async (req, res) => {
        try {
            const { classification_grade } = req.params;
            const classificationGrade = await ClassificationGrade.findById(classification_grade);
            if (!classificationGrade) {
                return res.status(404).json({ message: "Grade not found" });
            }
            const selected_registered_students = req.body;
            if (!Array.isArray(selected_registered_students)) {
                return res.status(404).json({ message: "data protocol error array students required for deregistering students" });
            }
            const dereg_new_students = [];
            const external_students_info = [];
            for (const registred_student of selected_registered_students) {
                const reg_student = await StudentGrade.findById(registred_student);
                if (!reg_student) {
                    return res.status(404).json({ message: "Non Registred Student Information Found (Invalid ID Data)." });
                }
                if (!reg_student.classification_grade.equals(classificationGrade._id)) {
                    return res.status(404).json({ message: "Some students are not belongs to the selected grade" });
                }
                if (reg_student.grade_section) {
                    return res.status(400).json({ message: `Sectioned student ${reg_student._id} can not be derigistered!` });
                }
                if (reg_student.external_student_prior_info) {
                    external_students_info.push(reg_student.external_student_prior_info);
                } else if (!reg_student.previous_student_grade) {
                    dereg_new_students.push(reg_student.student);
                }
            }
            const result = await StudentGrade.deleteMany({ _id: { $in: selected_registered_students } });
            await ExternalStudentPriorInfo.updateMany(
                { _id: { $in: external_students_info } },
                { $set: { is_referred: false } }
            );
            await Student.updateMany(
                { _id: { $in: dereg_new_students } },
                { $set: { has_perior_school_info: false } }
            );
            res.status(200).json(result);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    allocateSection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const gradeSection = await GradeSection.findById(grade_section);
            if (!gradeSection) {
                return res.status(404).json({ message: "Grade Section not found" });
            }
            const selected_students = req.body;
            if (!Array.isArray(selected_students)) {
                return res.status(404).json({ message: "error array students required" });
            }
            const section_students = [];
            for (const student_grade_id of selected_students) {
                const student_grade = await StudentGrade.findById(student_grade_id);
                if (!student_grade) {
                    return res.status(404).json({ message: "Non Registred Student Information Found (Invalid ID Data)." });
                }
                if (!student_grade.classification_grade.equals(gradeSection.classification_grade)) {
                    return res.status(404).json({ message: `Student ${student_grade_id} does not belong to the selected grade` });
                }
                if (student_grade.grade_section) {
                    return res.status(400).json({ message: `Student ${student_grade_id} is sectioned student!` });
                }
                section_students.push(student_grade_id);
            }
            const result = await StudentGrade.updateMany(
                { _id: { $in: section_students } },
                { $set: { grade_section: gradeSection._id } }
            );

            await registerStudentClasses(grade_section, section_students);
            res.status(200).json(result);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    detachSection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const selected_students = req.body;
            if (!Array.isArray(selected_students) || selected_students.length === 0) {
                return res.status(400).json({ message: "Error: An array of student IDs is required." });
            }

            const studentGrades = await StudentGrade.find({ _id: { $in: selected_students } }).lean();
            if (studentGrades.length !== selected_students.length) {
                return res.status(400).json({ message: "Some provided student IDs are invalid." });
            }            
            for (const student of studentGrades) {
                if (!student.grade_section?.equals(grade_section)) {
                    return res.status(400).json({ message: `Student ${student._id} is not in the correct section.` });
                }               
            }            
            const studentClassIds = await StudentClass.distinct("_id", { student_grade: { $in: selected_students } });
            const resultsExist = await StudentResult.exists({ student_class: { $in: studentClassIds } });
            if (resultsExist) {
                return res.status(400).json({ message: "Some students have results and cannot be detached." });
            }

            await StudentClass.deleteMany({ student_grade: { $in: selected_students} });
            const result = await StudentGrade.updateMany(
                { _id: { $in: selected_students} },
                { $unset: { grade_section: 1 } }
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    syncClasses: async (req, res) => {
        try {
            const { grade_section } = req.params;

            const studentGrades = await StudentGrade.find({ grade_section: grade_section }).lean();
            const studentGradeIds = studentGrades.map(stud => stud._id);

            const existingStudentClasses = await StudentClass.find({ student_grade: { $in: studentGradeIds } })
                .select('student_grade section_class');

            const studentClassMap = new Map();
            studentGradeIds.forEach(studId => studentClassMap.set(studId.toString(), new Set()));

            existingStudentClasses.forEach(({ student_grade, section_class }) => {
                studentClassMap.get(student_grade.toString()).add(section_class.toString());
            });
            const sectionClasses = await SectionClass.find({ grade_section: grade_section });
            const sectionClassIds = sectionClasses.map(sub => sub._id.toString());

            const newStudentClasses = [];
            studentGradeIds.forEach(studId => {
                const existingClass = studentClassMap.get(studId.toString());
                sectionClassIds.forEach(secClass => {
                    if (!existingClass.has(secClass)) {
                        newStudentClasses.push({ student_grade: studId, section_class: secClass });
                    }
                });
            });
            const insertedClasses = await StudentClass.insertMany(newStudentClasses);
            res.status(201).json(insertedClasses);
        } catch (error) {
            //console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
};
module.exports = studentGradeController;