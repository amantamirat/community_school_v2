import { GradeService } from "@/services/GradeService";
import { ClassificationGrade, Grade, AdmissionClassification, CurriculumGrade } from "@/types/model";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";
import { ClassificationGradeService } from "@/services/ClassificationGradeService";
import { CurriculumGradeService } from "@/services/CurriculumGradeService";
import { Toolbar } from "primereact/toolbar";
import { gradeTemplate } from "@/types/templates";

interface ClassificationGradeProps {
    addmission_classification: AdmissionClassification;
}

const ClassificationGradeComponent = (props: ClassificationGradeProps) => {

    let emptyClassificationGrade: ClassificationGrade = {
        admission_classification: props.addmission_classification,
        curriculum_grade: ''
    };

    const [grades, setGrades] = useState<Grade[]>([]);
    const [curriculumGrades, setCurriculumGrades] = useState<CurriculumGrade[]>([]);
    const [classificationGrades, setClassificationGrades] = useState<ClassificationGrade[]>([]);
    const [selectedClassificationGrade, setSelectedClassificationGrade] = useState<ClassificationGrade>(emptyClassificationGrade);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        loadGrades();
        loadCurriculumGrades();
        loadClassificationGrades();
    }, []);

    const loadGrades = async () => {
        try {
            const data = await GradeService.getGrades();
            setGrades(data); // Update state with fetched data
        } catch (err) {
            //console.error('Failed to load grades:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const loadCurriculumGrades = async () => {
        try {
            const curriculumId = typeof props.addmission_classification.curriculum === 'string'
                ? props.addmission_classification.curriculum
                : props.addmission_classification.curriculum?._id;
            if (curriculumId) {
                const data = await CurriculumGradeService.getCurriculumGradesByCurriculum(curriculumId);
                setCurriculumGrades(data);
            }
        } catch (err) {
            //console.error('Failed to load grades:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load curriculum grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const loadClassificationGrades = async () => {
        try {
            const data = await ClassificationGradeService.getClassificationGradesByClassification(props.addmission_classification._id ?? '');
            setClassificationGrades(data);
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load curr grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const validateClassificationGrade = (classGrade: ClassificationGrade) => {
        if (!classGrade.admission_classification || !classGrade.curriculum_grade) {
            return false;
        }
        return true;
    };

    const saveClassificationGrade = async () => {
        setSubmitted(true);
        if (!validateClassificationGrade(selectedClassificationGrade)) {
            return
        }
        let _classificationGrades = [...(classificationGrades as any)];
        try {
            const newClassificationGrade = await ClassificationGradeService.createClassificationGrade(selectedClassificationGrade);
            _classificationGrades.push(newClassificationGrade);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Grade Added',
                life: 1500
            });
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to add grade',
                detail: '' + error,
                life: 1500
            });
        }
        setClassificationGrades(_classificationGrades);
        setShowAddDialog(false);
        setSelectedClassificationGrade(emptyClassificationGrade);
    }
    const deleteClassificationGrade = async () => {
        try {
            const deleted = await ClassificationGradeService.deleteClassificationGrade(selectedClassificationGrade._id ?? '');
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

    const openAddDialog = () => {
        setSelectedClassificationGrade(emptyClassificationGrade);
        setSubmitted(false);
        setShowAddDialog(true);
    };

    const hideAddDialog = () => {
        setSubmitted(false);
        setShowAddDialog(false);
    };
    const addDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideAddDialog} />
            <Button label="Add" icon="pi pi-check" text onClick={saveClassificationGrade} />
        </>
    );

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

    const startToolbarTemplate = () => {
        return (
            <div className="my-2">
                <Button label="Add Grade" icon="pi pi-plus" severity="success" className="mr-2" onClick={openAddDialog} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Classfication Grades</h5>
        </div>
    );

    const findGradeById = (id: string): Grade | undefined => {
        return grades.find(grade => grade._id === id);
    };
    const findCurriculumGradeById = (id: string): CurriculumGrade | undefined => {
        return curriculumGrades.find(curr_grade => curr_grade._id === id);
    };

    const gradeBodyTemplate = (rowData: ClassificationGrade) => {
        const grade = typeof rowData.curriculum_grade === "string" ? findGradeById(findCurriculumGradeById(rowData.curriculum_grade)?.grade || '') : '';
        return gradeTemplate(grade as Grade);
    };


    const actionBodyTemplate = (rowData: ClassificationGrade) => {
        return (
            <>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveClassificationGrade(rowData)} />
            </>
        );
    };
    //<Column field="grade" body={(rowData) => gradeTemplate(grades.find(grade => grade._id === rowData.grade) as Grade)} header='Grade'></Column>

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
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
                        <Column field="curriculum_grade" header="Curriculum Grade" body={gradeBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showAddDialog}
                        style={{ width: '450px' }}
                        header="Add Grade"
                        modal
                        className="p-fluid"
                        footer={addDialogFooter}
                        onHide={hideAddDialog}
                    >
                        {selectedClassificationGrade ? <>
                            <div className="field">
                                <label htmlFor="grade">Grade (Curriculum Grade)</label>
                                <div id="grade">
                                    <Dropdown
                                        value={selectedClassificationGrade.curriculum_grade || null}
                                        onChange={(e) => setSelectedClassificationGrade({ ...selectedClassificationGrade, curriculum_grade: e.value })}
                                        options={curriculumGrades.filter(curr_grade =>
                                            !classificationGrades.some(classificationGrade => classificationGrade.curriculum_grade === curr_grade._id)
                                        )}
                                        placeholder="Select a Grade"
                                        optionLabel="_id"
                                        filter
                                        className={classNames({
                                            'p-invalid': submitted && !selectedClassificationGrade.curriculum_grade,
                                        })}
                                    />
                                </div>
                                {submitted && !selectedClassificationGrade.curriculum_grade && <small className="p-invalid">Grade is required.</small>}
                            </div>
                        </> : <></>}
                    </Dialog>

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