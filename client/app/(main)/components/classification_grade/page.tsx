import { ClassificationGradeService } from "@/services/ClassificationGradeService";
import { AdmissionClassification, ClassificationGrade } from "@/types/model";
import { classificationGradeTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { useEffect, useRef, useState } from "react";

interface ClassificationGradeProps {
    addmission_classification: AdmissionClassification;
}

const ClassificationGradeComponent = (props: ClassificationGradeProps) => {

    let emptyClassificationGrade: ClassificationGrade = {
        admission_classification: props.addmission_classification,
        curriculum_grade: ''
    };

    const [classificationGrades, setClassificationGrades] = useState<ClassificationGrade[]>([]);
    const [selectedClassificationGrade, setSelectedClassificationGrade] = useState<ClassificationGrade>(emptyClassificationGrade);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadClassificationGrades();
    }, []);


    const loadClassificationGrades = async () => {
        try {
            ClassificationGradeService.getClassificationGradesByClassification(props.addmission_classification).then((data) => {
                setClassificationGrades(data);
            });
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load curr grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const syncCurriculumGrades = async () => {
        if (props.addmission_classification) {
            setLoading(true);
            try {
                const sync_grades: ClassificationGrade[] = await ClassificationGradeService.syncCurriculumGrades(props.addmission_classification);
                if (sync_grades.length > 0) {
                    setClassificationGrades(prevGrades => [...prevGrades, ...sync_grades]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: `${sync_grades.length} curriculum grades added.`,
                        life: 3000
                    });
                } else {
                    //console.log('nothing sync');
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Updated Grades',
                        detail: "Nothing synced. Already up to date.",
                        life: 3000
                    });
                }
            } catch (error) {
                //console.error('Error syncing curriculum grades:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to sync curriculum grades',
                    detail: 'Error syncing curriculum grades:' + error,
                    life: 3000
                });
            } finally {
                setLoading(false);
            }
        }
    }

    const deleteClassificationGrade = async () => {
        try {
            if (selectedClassificationGrade) {
                const deleted = await ClassificationGradeService.deleteClassificationGrade(selectedClassificationGrade);
                if (deleted) {
                    let _classificationGrades = (classificationGrades as any)?.filter((val: any) => val._id !== selectedClassificationGrade._id);
                    setClassificationGrades(_classificationGrades);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Grade Deleted',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to remove grade',
                detail: '' + error,
                life: 1500
            });
        }
        setShowRemoveDialog(false);
        setSelectedClassificationGrade(emptyClassificationGrade);
    }


    const confirmRemoveClassificationGrade = (classificationGrade: ClassificationGrade) => {
        setSelectedClassificationGrade(classificationGrade);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteClassificationGrade} />
        </>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Classfication Grades</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <div className="my-2">
                    <Button tooltip="Sync Grades" icon="pi pi-sync" raised severity="secondary" loading={loading} rounded className="mr-2" onClick={syncCurriculumGrades} />
                </div>
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: ClassificationGrade) => {
        return (
            <>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveClassificationGrade(rowData)} />
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
                        value={classificationGrades}
                        selection={selectedClassificationGrade}
                        onSelectionChange={(e) => setSelectedClassificationGrade(e.value)}
                        dataKey="_id"
                        emptyMessage={`No grade for ${props.addmission_classification.classification} classification found.`}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} grades"
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column header="Classfication Grade" body={classificationGradeTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showRemoveDialog}
                        style={{ width: '450px' }}
                        header="Confirm to Delete Curriculum Grade"
                        modal
                        footer={removeDialogFooter}
                        onHide={hideRemoveDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedClassificationGrade && (
                                <span>
                                    Are you sure you want to delete <b>{selectedClassificationGrade._id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ClassificationGradeComponent;