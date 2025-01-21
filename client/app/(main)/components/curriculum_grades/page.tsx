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
import { CurriculumGradeService } from "@/services/CurriculumGradeService";

interface CurriculumGradeProps {
    curriculum: Curriculum;
}


const CurriculumGradeComponent = (props: CurriculumGradeProps) => {
    let emptyCurriculumGrade: CurriculumGrade = {
        curriculum: props.curriculum,
        grade: ''
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
        loadCurriculumGrades();
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

    const loadCurriculumGrades = async () => {
        try {
            const data = await CurriculumGradeService.getCurriculumGradesByCurriculum(props.curriculum);
            setCurriculumGrades(data);
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load curr grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const validateCurriculumGrade = (curriculumGrade: CurriculumGrade) => {
        if (!curriculumGrade.grade) {
            return false;
        }
        return true;
    };

    const saveCurriculumGrade = async () => {
        setSubmitted(true);
        if (!validateCurriculumGrade(selectedCurriculumGrade)) {
            return;
        }
        let _curriculumGrades = [...(curriculumGrades as any)];
        try {
            const newCurriculumGrade = await CurriculumGradeService.createCurriculumGrade(selectedCurriculumGrade);
            _curriculumGrades.push(newCurriculumGrade);
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
        setCurriculumGrades(_curriculumGrades);
        setShowAddDialog(false);
        setSelectedCurriculumGrade(emptyCurriculumGrade);
    }
    const deleteCurriculumGrade = async () => {
        try {
            const deleted = await CurriculumGradeService.deleteCurriculumGrade(selectedCurriculumGrade);
            if (deleted) {
                let _curriculumGrades = (curriculumGrades as any)?.filter((val: any) => val._id !== selectedCurriculumGrade._id);
                setCurriculumGrades(_curriculumGrades);
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
                <Button label="Add Grade" icon="pi pi-plus" severity="help" outlined className="mr-2" onClick={openAddDialog} />
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
                                curriculumGrade={data as CurriculumGrade}
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
                        header="Add Curriculum Grade"
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
                                        value={selectedCurriculumGrade.grade}
                                        onChange={(e) => setSelectedCurriculumGrade({ ...selectedCurriculumGrade, grade: e.value })}
                                        options={grades.filter(grade =>
                                            !curriculumGrades.some(curriculumGrade => curriculumGrade.grade === grade._id)
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
                                    Are you sure you want to delete <b>{selectedCurriculumGrade._id}</b>?
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