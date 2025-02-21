import { StudentClassService } from "@/services/StudentClassService";
import { ClassificationGrade, CurriculumGrade, Grade, Student, StudentClass, StudentGrade } from "@/types/model";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import StudentResultComponent from "../student_results/page";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface StudentClassProps {
    studentGrade: StudentGrade;
    classficiactionGrade?: ClassificationGrade

}

const StudentClassComponent = (props: StudentClassProps) => {

    let emptyStudentClass: StudentClass = {
        student_grade: props.studentGrade,
        term_class: '',
        status: 'ACTIVE'
    };

    const [studentClasss, setStudentClasss] = useState<StudentClass[]>([]);
    const [selectedStudentClass, setSelectedStudentClass] = useState<StudentClass>(emptyStudentClass);
    const toast = useRef<Toast>(null);
    const [expandedClassRows, setExpandedClassRows] = useState<any[] | DataTableExpandedRows>([]);

    useEffect(() => {
        loadStudentClasss();
    }, []);


    const loadStudentClasss = async () => {
        try {
            StudentClassService.getStudentClasss(props.studentGrade).then((data) => {
                setStudentClasss(data);
                console.log(data);
            });
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load student class',
                detail: '' + err,
                life: 3000
            });
        }
    };


    const studentData = {
        name: "John Doe",
        grade: "10th",
        subjects: [
            { subject: "Math", marks: 95 },
            { subject: "Science", marks: 89 },
            { subject: "English", marks: 92 },
            { subject: "History", marks: 85 },
        ],
        totalMarks: 361,
        maxMarks: 400,
        percentage: 90.25,
    };

    // Function to generate the PDF
    const generateReport = () => {
        const doc = new jsPDF() as any; // Cast to 'any' to bypass type issues

        // Title
        doc.setFontSize(18);
        doc.text("Student Report Card", 14, 20);

        // Student details
        doc.setFontSize(12);
        const student = (props.studentGrade.student as Student);
        const grade = (props.classficiactionGrade?.curriculum_grade as CurriculumGrade).grade as Grade;
        doc.text(`Name: ${student.first_name} ${student.last_name}`, 14, 30);
        doc.text(`Grade: ${grade.stage}-${grade.level} ${grade.specialization ? `(${grade.specialization})` : ''}`, 14, 40);

        // Add table with subjects and marks
        doc.autoTable({
            head: [['Subject', 'Marks']],
            body: studentData.subjects.map(item => [item.subject, item.marks]),
            startY: 50,
            theme: 'striped',
        });

        // Total and percentage
        doc.text(`Total Marks: ${studentData.totalMarks}/${studentData.maxMarks}`, 14, doc.lastAutoTable.finalY + 10);
        doc.text(`Percentage: ${studentData.percentage}%`, 14, doc.lastAutoTable.finalY + 20);

        // Generate PDF and open in browser
        doc.save(`${student.first_name}_Report_Card.pdf`);
    };


    const getSeverity = (value: string) => {
        switch (value) {
            case 'COMPLETED':
                return 'success';

            case 'ACTIVE':
                return 'info';

            case 'INCOMPLETE':
                return 'danger';

            default:
                return null;
        }
    };

    const statusBodyTemplate = (rowData: StudentClass) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)}></Tag>;
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Registred Classes</h5>
            {props.studentGrade.status !== 'ACTIVE' &&
                <span className="block mt-2 md:mt-0">
                    <div className="my-2">
                        <Button label="Generate Report Card" onClick={generateReport} />
                    </div>
                </span>
            }
        </div>
    );


    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <DataTable
                        header={header}
                        value={studentClasss}
                        selection={selectedStudentClass}
                        onSelectionChange={(e) => setSelectedStudentClass(e.value)}
                        emptyMessage={'No class found.'}
                        expandedRows={expandedClassRows}
                        onRowToggle={(e) => setExpandedClassRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <StudentResultComponent
                                student_class={data as StudentClass}
                            />
                        )}
                    >
                        <Column expander style={{ width: '4em' }} />
                        <Column field="term_class.subject_term.grade_subject.subject.title" header="Class" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="term_class.subject_term.term" header="Term" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        {props.studentGrade.status !== 'ACTIVE' && <Column field="total_result" header="Total" sortable headerStyle={{ minWidth: '10rem' }}></Column>}
                        <Column field="status" header="Status" sortable body={statusBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>

                    </DataTable>


                </div>
            </div>
        </div>
    );
};

export default StudentClassComponent;