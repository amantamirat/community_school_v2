import { GradeSubjectService } from "@/services/GradeSubjectService";
import { SubjectService } from "@/services/SubjectService";
import { CurriculumGrade, GradeSubject, Subject } from "@/types/model";
import { subjectTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { OverlayPanel } from "primereact/overlaypanel";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";
import SubjectWeightComponent from "../subject_weight/page";

interface GradeSubjectProps {
    curriculumGrade: CurriculumGrade;
}

const GradeSubjectComponent = (props: GradeSubjectProps) => {
    let emptyGradeSubject: GradeSubject = {
        curriculum_grade: props.curriculumGrade,
        subject: '',
        optional: false
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
        loadGradeSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await SubjectService.getSubjects();
            setSubjects(data); // Update state with fetched data
        } catch (err) {
            //console.error('Failed to load subjects:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load subjects',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const loadGradeSubjects = async () => {
        try {
            const data = await GradeSubjectService.getGradeSubjectsByCurriculumGrade(props.curriculumGrade);
            setGradeSubjects(data);
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load grade subjects',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const saveGradeSubject = async () => {
        setSubmitted(true);
        let _gradeSubjects = [...(gradeSubjects as any)];
        try {
            if (selectedGradeSubject._id) {
                const updatedGradeSubject = await GradeSubjectService.updateGradeSubject(selectedGradeSubject);
                if (updatedGradeSubject) {
                    const gradeSubject = { ...selectedGradeSubject }
                    const index = findIndexById(selectedGradeSubject._id);
                    _gradeSubjects[index] = gradeSubject;
                }
            } else {
                const newGradeSubject = await GradeSubjectService.createGradeSubject(selectedGradeSubject);
                const gradeSubject = { ...selectedGradeSubject, _id: newGradeSubject._id }
                _gradeSubjects.push(gradeSubject);
            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `Grade Subject ${selectedGradeSubject._id ? 'Updated' : 'Added'}`,
                life: 1500
            });
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: `Failed to ${selectedGradeSubject._id ? 'Update' : 'Add'} subject.`,
                detail: '' + error,
                life: 1500
            });
        }
        setGradeSubjects(_gradeSubjects)
        setShowAddDialog(false);
        setSelectedGradeSubject(emptyGradeSubject);
    }
    const deleteGradeSubject = async () => {
        try {
            if (selectedGradeSubject._id) {
                const deleted = await GradeSubjectService.deleteGradeSubject(selectedGradeSubject);
                if (deleted) {
                    let _gradeSubjects = (gradeSubjects as any)?.filter((val: any) => val._id !== selectedGradeSubject._id);
                    setGradeSubjects(_gradeSubjects);
                }
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Subject Removed',
                    life: 1500
                });
            }
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

    const openEditDialog = (rowData: GradeSubject) => {
        setSelectedGradeSubject(rowData);
        setSubmitted(false);
        setShowAddDialog(true);
    };

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
            <Button label="Save" icon="pi pi-check" text onClick={saveGradeSubject} />
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

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (gradeSubjects as any)?.length; i++) {
            if ((gradeSubjects as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const actionBodyTemplate = (rowData: GradeSubject) => {
        const op = useRef<OverlayPanel>(null);
        const toggleSubjectWeight = (event: any) => {
            op.current?.toggle(event);
        };
        return (
            <>
                <Button type="button" label="Weights" onClick={toggleSubjectWeight} outlined rounded style={{ marginRight: '10px' }} />
                <OverlayPanel ref={op} appendTo={typeof window !== 'undefined' ? document.body : null} showCloseIcon id="overlay_panel" style={{ width: '450px' }}>
                    <SubjectWeightComponent
                        gradeSubject={rowData as GradeSubject}
                    />
                </OverlayPanel>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveGradeSubject(rowData)} />
            </>
        );
    };

    const subjectBodyTemplete = (rowData: GradeSubject) => {
        const subject = subjects.find(subject => subject._id === rowData.subject) as Subject;
        return subjectTemplate(subject);

    }

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
                        <Column field="subject.title" header="Subject" sortable></Column>
                        <Column field="subject.load" header="Load (hrs/week)" sortable ></Column>
                        {/*<Column field="optional" header="Optional" sortable headerStyle={{ minWidth: '10rem' }}></Column>*/}
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showAddDialog}
                        style={{ width: '450px' }}
                        header={selectedGradeSubject ? selectedGradeSubject._id ? "Edit Subject" : "Add Subject" : "No Grade Subject"}
                        modal
                        className="p-fluid"
                        footer={addDialogFooter}
                        onHide={hideAddDialog}
                    >
                        {selectedGradeSubject ? <>
                            {!selectedGradeSubject._id ? <>
                                <div className="field">
                                    <label htmlFor="subject">Subject</label>
                                    <div id="subject">
                                        <Dropdown
                                            value={selectedGradeSubject.subject}
                                            onChange={(e) => setSelectedGradeSubject({ ...selectedGradeSubject, subject: e.value })}
                                            options={subjects.filter(subject =>
                                                !gradeSubjects.some(gradeSubject => {
                                                    // Check if gradeSubject.subject is a string or a Subject object
                                                    const gradeSubjectId = typeof gradeSubject.subject === 'string'
                                                        ? gradeSubject.subject // If it's a string, use it directly
                                                        : gradeSubject.subject._id; // If it's an object, use its _id property
                                                    return gradeSubjectId === subject._id; // Compare with subject._id
                                                })
                                            )}
                                            itemTemplate={subjectTemplate}
                                            valueTemplate={selectedGradeSubject.subject ? subjectTemplate : ""}
                                            placeholder="Select a Subject"
                                            optionLabel="_id"
                                            emptyMessage="No Subjects Found."
                                            className={classNames({
                                                'p-invalid': submitted && !selectedGradeSubject.subject,
                                            })}
                                        />
                                    </div>
                                    {submitted && !selectedGradeSubject.subject && <small className="p-invalid">Subject is required.</small>}
                                </div>
                            </> : <></>}
                            <div className="field">
                                <label htmlFor="optional">Optional</label>
                                <div id="optional">
                                    <InputSwitch
                                        checked={selectedGradeSubject.optional}
                                        onChange={(e) => setSelectedGradeSubject({ ...selectedGradeSubject, optional: !selectedGradeSubject.optional })}
                                        disabled />
                                </div>
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
                                    Are you sure you want to delete <b>{selectedGradeSubject._id}</b>?
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