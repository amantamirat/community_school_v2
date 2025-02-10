import { StudentClassService } from "@/services/StudentClassService";
import { StudentClass, StudentGrade } from "@/types/model";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import StudentResultComponent from "../student_results/page";

interface StudentClassProps {
    student_grade: StudentGrade;
}

const StudentClassComponent = (props: StudentClassProps) => {

    let emptyStudentClass: StudentClass = {
        student_grade: props.student_grade,
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
            StudentClassService.getStudentClasss(props.student_grade).then((data) => {
                setStudentClasss(data);
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
            <span className="block mt-2 md:mt-0">
                <div className="my-2">
                    <Button label="Report" text />
                </div>
            </span>
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
                        emptyMessage={`No class for ${props.student_grade} found.`}
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
                        {props.student_grade.status !== 'ACTIVE' && <Column field="total_result" header="Total" sortable headerStyle={{ minWidth: '10rem' }}></Column>}
                        <Column field="status" header="Status" sortable body={statusBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>

                    </DataTable>


                </div>
            </div>
        </div>
    );
};

export default StudentClassComponent;