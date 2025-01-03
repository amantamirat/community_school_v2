import { CurriculumService } from "@/services/CurriculumService";
import { SubjectService } from "@/services/SubjectService";
import { Curriculum, CurriculumGrade, Subject } from "@/types/model";
import { subjectTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";

interface GradeSubjectProps {
    curriculum: Curriculum;
    curriculumGrade: CurriculumGrade;
    updateCurriculum: (updatedCurriculum: Curriculum) => void;
    updateCurriculumGrade: (updatedCurriculumGrade: CurriculumGrade) => void;
}

type GradeSubject = {
    _id?: string;
    subject: string;
}

const GradeSubjectComponent = (props: GradeSubjectProps) => {
    let emptyGradeSubject: GradeSubject = {
        subject: '',
    };
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [gradeSubjects, setGradeSubjects] = useState<GradeSubject[]>([]);
    const [selectedGradeSubject, setSelectedGradeSubject] = useState<GradeSubject>(emptyGradeSubject);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        loadSubjects();
        setGradeSubjects(props.curriculumGrade.subjects || []);
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await SubjectService.getSubjects();
            setSubjects(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load subjects:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load subjects',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const saveGradeSubject = async () => {
        setSubmitted(true);
        try {
            const updatedCurriculum = await CurriculumService.addSubject(props.curriculum._id || "", props.curriculumGrade?._id || "", selectedGradeSubject.subject);
            props.updateCurriculum(updatedCurriculum);
            const updatedCurriculumGrade = updatedCurriculum.grades.find(curriculumGrade => curriculumGrade._id === props.curriculumGrade._id);
            props.updateCurriculumGrade(updatedCurriculumGrade as CurriculumGrade)
            setGradeSubjects(updatedCurriculumGrade?.subjects || []);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Subject Added',
                life: 1500
            });
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to add subjects',
                detail: '' + error,
                life: 1500
            });
        }
        setShowAddDialog(false);
        setSelectedGradeSubject(emptyGradeSubject);
    }
    const deleteGradeSubject = async () => {
        try {
            const updatedCurriculum = await CurriculumService.removeSubject(props.curriculum._id || "", props.curriculumGrade._id || "", selectedGradeSubject._id || "");
            props.updateCurriculum(updatedCurriculum);
            const updatedCurriculumGrade = updatedCurriculum.grades.find(curriculumGrade => curriculumGrade._id === props.curriculumGrade._id);
            props.updateCurriculumGrade(updatedCurriculumGrade as CurriculumGrade)
            setGradeSubjects(updatedCurriculumGrade?.subjects || []);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Subject Removed',
                life: 1500
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to remove subject',
                detail: '' + error,
                life: 1500
            });
        }
        setShowRemoveDialog(false);
        setSelectedGradeSubject(emptyGradeSubject);
    }

    const openAddDialog = () => {
        setSelectedGradeSubject(emptyGradeSubject);
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
            <Button label="Add" icon="pi pi-check" text onClick={saveGradeSubject} />
        </>
    );

    const confirmRemoveGradeSubject = (gradeSubject: GradeSubject) => {
        setSelectedGradeSubject(gradeSubject);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteGradeSubject} />
        </>
    );
    const header = () => {
        return (
            <>
                <Button label="Add Subject" icon="pi pi-plus" onClick={openAddDialog} />
            </>
        );
    }

    const actionBodyTemplate = (rowData: GradeSubject) => {
        return (
            <>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveGradeSubject(rowData)} />
            </>
        );
    };
    //body={(rowData) => subjectTemplate(subjects.find(subject => subject._id === rowData.subject) as Subject)} 
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <DataTable
                        header={header}
                        value={gradeSubjects}
                        selection={selectedGradeSubject}
                        dataKey="_id"
                        emptyMessage={`No subject found.`}
                    >
                        <Column field="subject" header="Subject"></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showAddDialog}
                        style={{ width: '450px' }}
                        header="Add Subject"
                        modal
                        className="p-fluid"
                        footer={addDialogFooter}
                        onHide={hideAddDialog}
                    >
                        {selectedGradeSubject ? <>
                            <div className="field">
                                <label htmlFor="subject">Subject</label>
                                <div id="subject">
                                    <Dropdown
                                        value={subjects.find(subject => subject._id === selectedGradeSubject.subject) || null}
                                        onChange={(e) => setSelectedGradeSubject({ ...selectedGradeSubject, subject: e.value ? e.value._id : "" })}
                                        options={subjects.filter(subject =>
                                            !props.curriculumGrade.subjects.some(gradeSubject => gradeSubject.subject === subject._id)
                                        )}
                                        itemTemplate={subjectTemplate}
                                        valueTemplate={selectedGradeSubject.subject ? subjectTemplate : ""}
                                        placeholder="Select a Subject"
                                        optionLabel="_id"
                                        filter
                                        className={classNames({
                                            'p-invalid': submitted && !selectedGradeSubject.subject,
                                        })}
                                    />
                                </div>
                                {submitted && !selectedGradeSubject.subject && <small className="p-invalid">Subject is required.</small>}
                            </div>
                        </> : <></>}
                    </Dialog>

                    <Dialog
                        visible={showRemoveDialog}
                        style={{ width: '450px' }}
                        header="Confirm to Delete Grade Subject"
                        modal
                        footer={removeDialogFooter}
                        onHide={hideRemoveDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedGradeSubject && (
                                <span>
                                    Are you sure you want to delete <b>{selectedGradeSubject.subject}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default GradeSubjectComponent;