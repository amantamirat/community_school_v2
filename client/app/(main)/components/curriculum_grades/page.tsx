import { CurriculumService } from "@/services/CurriculumService";
import { GradeService } from "@/services/GradeService";
import { Curriculum, CurriculumGrade, Grade } from "@/types/model";
import { gradeTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";
import GradeSubjectComponent from "../grade_subjects/page";

interface CurriculumGradeProps {
    curriculum: Curriculum;
    updateCurriculum: (updatedCurriculum: Curriculum) => void;
}


const CurriculumGradeComponent = (props: CurriculumGradeProps) => {
    let emptyCurriculumGrade: CurriculumGrade = {
        grade: '',
        subjects: []
    };
    const [grades, setGrades] = useState<Grade[]>([]);
    const [curriculumGrades, setCurriculumGrades] = useState<CurriculumGrade[]>([]);
    const [selectedCurriculumGrade, setSelectedCurriculumGrade] = useState<CurriculumGrade>(emptyCurriculumGrade);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const [expandedGradeRows, setExpandedGradeRows] = useState<any[] | DataTableExpandedRows>([]);

    useEffect(() => {
        loadGrades();
        setCurriculumGrades(props.curriculum.grades as CurriculumGrade[]);
    }, []);

    const loadGrades = async () => {
        try {
            const data = await GradeService.getGrades();
            setGrades(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load grades:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const saveCurriculumGrade = async () => {
        setSubmitted(true);
        try {
            const updatedCurriculum = await CurriculumService.addGrade(props.curriculum?._id || '', selectedCurriculumGrade.grade);
            props.updateCurriculum(updatedCurriculum);
            setCurriculumGrades(updatedCurriculum.grades as CurriculumGrade[]);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Grade Added',
                life: 1500
            });
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to add grades',
                detail: '' + error,
                life: 1500
            });
        }
        setShowAddDialog(false);
        setSelectedCurriculumGrade(emptyCurriculumGrade);
    }
    const deleteCurriculumGrade = async () => {
        try {
            const updatedCurriculum = await CurriculumService.removeGrade(props.curriculum._id || "", selectedCurriculumGrade._id || "");
            props.updateCurriculum(updatedCurriculum);
            setCurriculumGrades(updatedCurriculum.grades as CurriculumGrade[]);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Grade Deleted',
                life: 1500
            });
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
        setSelectedCurriculumGrade(emptyCurriculumGrade);
    }

    const openAddDialog = () => {
        setSelectedCurriculumGrade(emptyCurriculumGrade);
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
            <Button label="Add" icon="pi pi-check" text onClick={saveCurriculumGrade} />
        </>
    );

    const confirmRemoveCurriculumGrade = (curriculumGrade: CurriculumGrade) => {
        setSelectedCurriculumGrade(curriculumGrade);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteCurriculumGrade} />
        </>
    );
    const header = () => {
        return (
            <>
                <Button label="Add Grade" icon="pi pi-plus" severity="success" className="mr-2" onClick={openAddDialog} />
            </>
        );
    }

    const actionBodyTemplate = (rowData: CurriculumGrade) => {
        return (
            <>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveCurriculumGrade(rowData)} />
            </>
        );
    };


    const handleUpdate = (updatedCurriculumGrade: CurriculumGrade) => {
        setCurriculumGrades((prevCurriculumGrades) =>
            prevCurriculumGrades.map((curriculumGrade) =>
                curriculumGrade._id === updatedCurriculumGrade._id ? updatedCurriculumGrade : curriculumGrade
            )
        );
    };


    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <DataTable
                        header={header}
                        value={curriculumGrades}
                        selection={selectedCurriculumGrade}
                        onSelectionChange={(e) => setSelectedCurriculumGrade(e.value)}
                        dataKey="_id"
                        emptyMessage={`No grade for ${props.curriculum.title} curriculum found.`}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} grades"
                        expandedRows={expandedGradeRows}
                        onRowToggle={(e) => setExpandedGradeRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <GradeSubjectComponent
                                curriculum={props.curriculum}
                                curriculumGrade={data as CurriculumGrade}
                                updateCurriculum={props.updateCurriculum}
                                updateCurriculumGrade={handleUpdate}
                            />
                        )}
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="grade" body={(rowData) => gradeTemplate(grades.find(grade => grade._id === rowData.grade) as Grade)} header='Grade'></Column>
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
                        {selectedCurriculumGrade ? <>
                            <div className="field">
                                <label htmlFor="grade">Grade</label>
                                <div id="grade">
                                    <Dropdown
                                        value={grades.find(grade => grade._id === selectedCurriculumGrade.grade) || null}
                                        onChange={(e) => setSelectedCurriculumGrade({ ...selectedCurriculumGrade, grade: e.value ? e.value._id : "" })}
                                        options={grades.filter(grade =>
                                            !props.curriculum?.grades.some(curriculumGrade => curriculumGrade.grade === grade._id)
                                        )}
                                        itemTemplate={gradeTemplate}
                                        valueTemplate={selectedCurriculumGrade.grade ? gradeTemplate : ""}
                                        placeholder="Select a Grade"
                                        optionLabel="_id"
                                        filter
                                        className={classNames({
                                            'p-invalid': submitted && !selectedCurriculumGrade.grade,
                                        })}
                                    />
                                </div>
                                {submitted && !selectedCurriculumGrade.grade && <small className="p-invalid">Grade is required.</small>}
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
                            {selectedCurriculumGrade && (
                                <span>
                                    Are you sure you want to delete <b>{selectedCurriculumGrade.grade}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CurriculumGradeComponent;