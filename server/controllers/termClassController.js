const SectionSubject = require('../models/section-subject');
const SubjectTerm = require('../models/subject-term');
const TermClass = require('../models/term-class');


const TermClassController = {
    getTermClassBySubject: async (req, res) => {
        try {
            const { section_subject } = req.params;
            const termClasses = await TermClass.find({ section_subject: section_subject })
                .populate({
                    path: 'subject_term',
                    populate: { path: 'grade_subject', populate: { path: 'subject', } },
                }).lean();
            res.status(200).json(termClasses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    approveTermClass: async (req, res) => {
        try {
            const { term_class } = req.params;
            const termClass = await TermClass.findById(term_class).populate('subject_term');
            if (!termClass) return res.status(404).json({ message: 'Term class not found' });
            if (termClass.status !== "SUBMITTED") return res.status(400).json({ message: 'Only SUBMITTED term classes can be approved' });
            termClass.status = "APPROVED";
            const savedTermClass = await termClass.save();
            let nextTermClass = null;
            let sectionSubject = null;
            const nextSubjectTerm = await SubjectTerm.findOne({ grade_subject: termClass.subject_term.grade_subject, term: termClass.subject_term.term + 1 }).lean();
            if (nextSubjectTerm) {
                nextTermClass = await TermClass.findOne({ section_subject: termClass.section_subject, subject_term: nextSubjectTerm._id });
                if (nextTermClass) {
                    nextTermClass.status = "ACTIVE";
                    await nextTermClass.save();
                }
            } else {
                sectionSubject = await SectionSubject.findById(termClass.section_subject);
                if (sectionSubject) {
                    sectionSubject.status = "CLOSED";
                    await sectionSubject.save();
                }
            }
            res.status(200).json({term_class:savedTermClass, next_term_class:nextTermClass, section_subject:sectionSubject});
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = TermClassController;

