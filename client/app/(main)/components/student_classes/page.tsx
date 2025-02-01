import { StudentClassService } from "@/services/StudentClassService";
import { StudentClass, StudentGrade } from "@/types/model";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { useEffect, useRef, useState } from "react";
import StudentResultComponent from "../student_results/page";

interface StudentClassProps {
    student_grade: StudentGrade;
}

const StudentClassComponent = (props: StudentClassProps) => {

    let emptyStudentClass: StudentClass = {
        student_grade: props.student_grade,
        section_class: ''
    };

    const [studentClasss, setStudentClasss] = useState<StudentClass[]>([]);
    const [selectedStudentClass, setSelectedStudentClass] = useState<StudentClass>(emptyStudentClass);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
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

    const syncStudentClasses = async () => {
        if (props.student_grade) {
            setLoading(true);
            try {
                const sync_grades: StudentClass[] = await StudentClassService.syncStudentClasses(props.student_grade);
                if (sync_grades.length > 0) {
                    setStudentClasss(prevGrades => [...prevGrades, ...sync_grades]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: `${sync_grades.length} student class added.`,
                        life: 3000
                    });
                } else {
                    //console.log('nothing sync');
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Updated Classes',
                        detail: "Nothing synced. Everything is up to date.",
                        life: 3000
                    });
                }
            } catch (error) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to sync classes',
                    detail: 'Error syncing classes:' + error,
                    life: 3000
                });
            } finally {
                setLoading(false);
            }
        }
    }

    const deleteStudentClass = async () => {
        try {
            if (selectedStudentClass) {
                const deleted = await StudentClassService.deleteStudentClass(selectedStudentClass);
                if (deleted) {
                    let _studentClasss = (studentClasss as any)?.filter((val: any) => val._id !== selectedStudentClass._id);
                    setStudentClasss(_studentClasss);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Class Deleted',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to class',
                detail: '' + error,
                life: 1500
            });
        }
        setShowRemoveDialog(false);
        setSelectedStudentClass(emptyStudentClass);
    }


    const confirmRemoveStudentClass = (studentClass: StudentClass) => {
        setSelectedStudentClass(studentClass);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteStudentClass} />
        </>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Registred Classes</h5>
            <span className="block mt-2 md:mt-0">
                <div className="my-2">
                    <Button tooltip="Sync Classes" icon="pi pi-sync" raised severity="secondary" loading={loading} rounded className="mr-2" onClick={syncStudentClasses} />
                </div>
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: StudentClass) => {
        return (
            <>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveStudentClass(rowData)} />
            </>
        );
    };

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
                        <Column field="section_class.subject_term.grade_subject.subject.title" header="Class" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="section_class.subject_term.term" header="Term" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showRemoveDialog}
                        style={{ width: '450px' }}
                        header="Confirm to Delete Class"
                        modal
                        footer={removeDialogFooter}
                        onHide={hideRemoveDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedStudentClass && (
                                <span>
                                    Are you sure you want to delete <b>{selectedStudentClass._id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default StudentClassComponent;