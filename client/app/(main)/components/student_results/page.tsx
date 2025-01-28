import { StudentResultService } from "@/services/StudentResultService";
import { StudentResult, StudentGrade, StudentClass } from "@/types/model";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { useEffect, useRef, useState } from "react";

interface StudentResultProps {
    student_class: StudentClass;
}

const StudentResultComponent = (props: StudentResultProps) => {

    let emptyStudentResult: StudentResult = {
        student_class: props.student_class,
        subject_weight: '',
        result: 0,
        status:'ONGOING'
    };

    const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
    const [selectedStudentResult, setSelectedStudentResult] = useState<StudentResult>(emptyStudentResult);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        StudentResultService.getStudentResultsByStudentClass(props.student_class).then((data) => {
            setStudentResults(data);
        }).catch((err) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load student class',
                detail: '' + err,
                life: 3000
            });
        });
    }, []);



    const deleteStudentResult = async () => {
        try {
            if (selectedStudentResult) {
                const deleted = await StudentResultService.deleteStudentResult(selectedStudentResult);
                if (deleted) {
                    let _studentResults = (studentResults as any)?.filter((val: any) => val._id !== selectedStudentResult._id);
                    setStudentResults(_studentResults);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Result Deleted',
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
        setSelectedStudentResult(emptyStudentResult);
    }


    const confirmRemoveStudentResult = (studentResult: StudentResult) => {
        setSelectedStudentResult(studentResult);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteStudentResult} />
        </>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Results</h5>
        </div>
    );

    const actionBodyTemplate = (rowData: StudentResult) => {
        return (
            <>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveStudentResult(rowData)} />
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
                        value={studentResults}
                        selection={selectedStudentResult}
                        onSelectionChange={(e) => setSelectedStudentResult(e.value)}
                        emptyMessage={`No result found for ${props.student_class}.`}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="subject_weight.assessment_type" header="Assesment" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="subject_weight.assessment_weight" header="Weight" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="result" header="Result" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
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
                            {selectedStudentResult && (
                                <span>
                                    Are you sure you want to delete <b>{selectedStudentResult._id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default StudentResultComponent;