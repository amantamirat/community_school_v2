import { ClassificationGradeService } from "@/services/ClassificationGradeService";
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { AdmissionClassification, ClassificationGrade } from "@/types/model";
import { classificationGradeTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import GradeSectionComponent from "../grade_section/page";
import { Tag } from "primereact/tag";

interface ClassificationGradeProps {
    addmissionClassification: AdmissionClassification;
    onUpdate: (updatedAdmission: AdmissionClassification) => void;
}

const ClassificationGradeComponent = (props: ClassificationGradeProps) => {

    let emptyClassificationGrade: ClassificationGrade = {
        admission_classification: props.addmissionClassification,
        curriculum_grade: '',
        status: 'OPEN'
    };
    const [classificationGrades, setClassificationGrades] = useState<ClassificationGrade[]>([]);
    const [selectedClassificationGrade, setSelectedClassificationGrade] = useState<ClassificationGrade>(emptyClassificationGrade);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState<any[] | DataTableExpandedRows>([]);
    useEffect(() => {
        loadClassificationGrades();
    }, []);

    const loadClassificationGrades = async () => {
        ClassificationGradeService.getClassificationGradesByClassification(props.addmissionClassification).then((data) => {
            console.log(data);
            setClassificationGrades(data);
        }).catch((err) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load classificatoin grades',
                detail: '' + err,
                life: 3000
            })
        });

    };

    const syncCurriculumGrades = async () => {
        if (props.addmissionClassification) {
            setLoading(true);
            try {
                if (props.addmissionClassification.status === 'CLOSED') {
                    throw new Error("Admission is Closed");
                }
                const sync_grades: ClassificationGrade[] = await ClassificationGradeService.syncCurriculumGrades(props.addmissionClassification);
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

    const closeAdmission = async () => {
        try {

            if (props.addmissionClassification.status === 'CLOSED') {
                throw new Error('Admission Already Closed');
            }
            setLoading(true);
            if (classificationGrades.length === 0) {
                throw new Error('Cannot close, No Grades Found.');
            }
            const hasOpenGrade = classificationGrades.some(grd => grd.status === 'OPEN');
            if (hasOpenGrade) {
                throw new Error('Cannot close grade, open sections exist.');
            }
            const closedAdmission = await AdmissionClassificationService.closeAdmission(props.addmissionClassification);
            if (closedAdmission.status === 'CLOSED') {
                props.onUpdate({ ...props.addmissionClassification, status: 'CLOSED' });
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Admission Closed',
                    life: 1500
                });
            }

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to close admission',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
    }


    const openAdmission = async () => {
        try {
            if (props.addmissionClassification) {
                if (props.addmissionClassification.status === 'OPEN') {
                    throw new Error('Admission Already Opened');
                }
                setLoading(true);
                const openedAdmission = await AdmissionClassificationService.openAdmission(props.addmissionClassification);
                if (openedAdmission.status === 'OPEN') {
                    props.onUpdate({ ...props.addmissionClassification, status: 'OPEN' });
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Backed to Opened!',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to open admission',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
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

    const getSeverity = (value: ClassificationGrade) => {
        switch (value.status) {
            case 'OPEN':
                return 'success';

            case 'CLOSED':
                return 'info';

            default:
                return null;
        }
    };

    const statusBodyTemplate = (rowData: ClassificationGrade) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData)}></Tag>;
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Classfication Grades</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <div className="my-2">
                    {props.addmissionClassification.status === 'OPEN' ?
                        <Button label='Close Admission' severity='info' icon="pi pi-lock" onClick={closeAdmission} loading={loading} style={{ marginRight: '10px' }}/>
                        : <Button label='Open Admission' severity='success' icon="pi pi-lock-open" onClick={openAdmission} loading={loading} style={{ marginRight: '10px' }} />
                    }
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

    const handleUpdateGrade = (updatedGrade: ClassificationGrade) => {
        let _classificationGrades = [...classificationGrades]
        const index = classificationGrades.findIndex((grd) => grd._id === updatedGrade._id);
        _classificationGrades[index] = { ...updatedGrade };
        setClassificationGrades(_classificationGrades);
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
                        emptyMessage={`No grade for ${props.addmissionClassification.classification} classification found.`}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} grades"
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <GradeSectionComponent
                                classificationGrade={data as ClassificationGrade}
                                onUpdate={handleUpdateGrade}
                            />
                        )}
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column header="Classfication Grade" field="curriculum_grade.grade.level" body={classificationGradeTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
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