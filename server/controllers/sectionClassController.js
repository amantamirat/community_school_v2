const SectionClass = require("../models/section-class");
const GradeSection = require('../models/grade-sections');
const SubjectTerm = require('../models/subject-term');
const StudentClass = require('../models/student-class');
const StudentResult = require('../models/student-result');

const SectionClassController = {

    getAllSectionClasssBySection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const SectionClasss = await SectionClass.find({ grade_section: grade_section }).populate('teacher').populate({
                path: 'subject_term',
                populate: { path: 'grade_subject', populate: { path: 'subject', } },
            });
            res.status(200).json(SectionClasss);
        } catch (error) {
            res.status(500).json({ message: error + "Error fetching Classs", error });
        }
    },

    getActiveSectionClasssBySection: async (req, res) => {
        try {
            const { grade_section } = req.params;
            const SectionClasss = await SectionClass.find({ grade_section: grade_section, status: 'ACTIVE' }).populate('teacher').populate({
                path: 'subject_term',
                populate: { path: 'grade_subject', populate: { path: 'subject', } },
            });
            res.status(200).json(SectionClasss);
        } catch (error) {
            res.status(500).json({ message: error + "Error fetching Classs", error });
        }
    },

    //for optional only
    createSectionClass: async (req, res) => {
        try {
            const { grade_section, subject_term } = req.body;

            const subjectTerm = await SubjectTerm.findById(subject_term).populate("grade_subject");
            if (!subjectTerm) {
                return res.status(404).json({ message: 'Subject Term not found' });
            }
            if (!subjectTerm.grade_subject.optional) {
                return res.status(400).json({
                    message: "Cannot create the Class. It must be optional.",
                });
            }

            const gradeSection = await GradeSection.findById(grade_section).populate("classification_grade");
            if (!gradeSection) {
                return res.status(404).json({ message: 'Grade section not found' });
            }

            // Validate that the curriculum grades match //make sure grade_section and grade_subject are in the same curriculum_grade
            if (!gradeSection.classification_grade.curriculum_grade.equals(subjectTerm.grade_subject.curriculum_grade)) {
                return res.status(400).json({
                    message: 'The GradeSection and GradeSubject must belong to the same Curriculum Grade'
                });
            }
            const subjectTerms = await SubjectTerm.find({ grade_subject: subjectTerm.grade_subject._id })
            const sectionClasses = [];
            for (const term of subjectTerms) {
                sectionClasses.push({
                    grade_section: grade_section,
                    subject_term: term._id
                })
            }
            const newSectionClasses = await SectionClass.insertMany(sectionClasses);
            res.status(201).json(newSectionClasses);
        } catch (error) {
            res.status(500).json({ message: "Error creating Class", error });
        }
    },

    allocateTeacher: async (req, res) => {
        try {
            const { grade_section, subject_term, teacher } = req.body;
            const subjectTerm = await SubjectTerm.findById(subject_term);
            if (!subjectTerm) {
                return res.status(404).json({ message: "Term (Subject) not found" });
            }
            const subjectTermIds = await SubjectTerm.distinct('_id', { grade_subject: subjectTerm.grade_subject });

            const updatedSectionClass = await SectionClass.updateMany(
                { grade_section, subject_term: { $in: subjectTermIds }, status: { $in: ['ACTIVE', 'PENDING'] } },
                { $set: { teacher } }
            );
            if (updatedSectionClass.modifiedCount === 0) {
                return res.status(404).json({ message: "No classes updated. Check the provided grade_section and subject_term values." });
            }
            res.status(200).json(updatedSectionClass.modifiedCount);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    removeTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const sectionClass = await SectionClass.findById(id).populate('subject_term');
            if (!sectionClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            const subjectTermIds = await SubjectTerm.distinct('_id', {
                grade_subject: sectionClass.subject_term.grade_subject
            });
            const updateResult = await SectionClass.updateMany(
                { grade_section: sectionClass.grade_section, subject_term: { $in: subjectTermIds } },
                { $unset: { teacher: 1 } }
            );
            if (updateResult.modifiedCount === 0) {
                return res.status(404).json({ message: "No classes updated. Check if records exist." });
            }

            res.status(200).json({ message: "Teacher removed successfully" });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "Error removing teacher", error });
        }
    },


    // Update a teacher only //change the name of the function
    updateSectionClass: async (req, res) => {
        try {
            const { id } = req.params;
            const { grade_section, grade_subject, teacher } = req.body;
            const updatedSectionClass = await SectionClass.findByIdAndUpdate(id, { grade_section, grade_subject, teacher }, { new: true });
            if (!updatedSectionClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            res.status(200).json(updatedSectionClass);
        } catch (error) {
            res.status(500).json({ message: "Error updating Class", error });
        }
    },

    // Delete a SectionClass
    deleteSectionClass: async (req, res) => {
        try {
            const { id } = req.params;
            const sectionClass = await SectionClass.findById(id).populate({ path: 'subject_term', populate: { path: 'grade_subject' } });
            if (!sectionClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            if (sectionClass.teacher) {
                return res.status(400).json({
                    message: "Cannot delete the Class. Teacher Exist.",
                });
            }
            if (!sectionClass.subject_term.grade_subject.optional) {
                return res.status(400).json({
                    message: "Cannot delete the Class. It is mandatory.",
                });
            }
            //check for the student result
            const studentClassIds = await StudentClass.distinct('_id', { section_class: id });
            if (studentClassIds.length > 0) {
                const referenced = await StudentResult.exists({
                    student_class: { $in: studentClassIds }
                });
                if (referenced) {
                    return res.status(400).json({
                        message: 'Deletion denied. One or more Student Result entries are associated with the class.'
                    });
                }
                await StudentClass.deleteMany({ _id: { $in: studentClassIds } });
            }
            const deletedClass = await SectionClass.findByIdAndDelete(id);
            if (!deletedClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            res.status(200).json({ message: "class deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting class" + error });
        }
    }
};

module.exports = SectionClassController;
