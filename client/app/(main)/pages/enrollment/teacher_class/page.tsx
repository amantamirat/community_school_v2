'use client';
import { useClassificationGrade } from "@/app/(main)/contexts/classificationGradeContext";
import { GradeSectionService } from "@/services/GradeSectionService";
import { SectionSubjectService } from "@/services/SectionSubjectService";
import { TeacherService } from "@/services/TeacherService";
import { GradeSection, SectionSubject, Teacher } from "@/types/model";
import { teacherTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";


const TeacherClassPage = () => {

    let emptySectionSubject: SectionSubject = {
        grade_section: '',
        grade_subject: '',
        teacher: '',
        status: 'ACTIVE'
    };
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const { selectedClassificationGrade } = useClassificationGrade();

    const [selectedSectionSubject, setSelectedSectionSubject] = useState<SectionSubject>(emptySectionSubject);
    const [sectionSubjects, setSectionSubjects] = useState<SectionSubject[]>([]);

    const [showTeacherDialog, setShowTeacherDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        TeacherService.getTeachers().then((data) => {
            setTeachers(data);
        }).catch((err) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to Load Teachers',
                detail: '' + err,
                life: 3000
            });
        });
    }, []);

    useEffect(() => {
        if (selectedClassificationGrade) {
            GradeSectionService.getGradeSectionsByClassificationGrade(selectedClassificationGrade).then((data) => {
                setGradeSections(data);
            }).catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed Load Grade Sections',
                    detail: '' + error,
                    life: 3000
                });
            }).finally(() => {

            });
        }
    }, [selectedClassificationGrade]);

    useEffect(() => {
        if (selectedGradeSection) {
            SectionSubjectService.getSectionClasssByGradeSection(selectedGradeSection).then((data) => {
                setSectionSubjects(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load section subjects',
                    detail: '' + err,
                    life: 3000
                });
            });
        }
    }, [selectedGradeSection]);




    const saveTeacherClass = async () => {
        setSubmitted(true);
        if (!selectedSectionSubject.teacher) {
            return
        }
        try {
            if (selectedSectionSubject.status !== "ACTIVE") throw new Error("Non Activated Class Found!");
            let _sectionSubjects = [...sectionSubjects];
            if (selectedSectionSubject._id) {
                const data = await SectionSubjectService.allocateTeacher(selectedSectionSubject);
                if (data) {
                    const index = sectionSubjects.findIndex((sub) => sub._id === selectedSectionSubject._id);
                    _sectionSubjects[index] = { ...selectedSectionSubject };
                    setSectionSubjects(_sectionSubjects);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Teacher Allocated',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            console.log(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to allocate teacher',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setShowTeacherDialog(false);
            setSelectedSectionSubject(emptySectionSubject);
        }
    }
    const removeTeacherClass = async () => {
        try {
            if (selectedSectionSubject._id) {
                if (selectedSectionSubject.status !== "ACTIVE") throw new Error("Non Activated Class Found!");
                const deleted = await SectionSubjectService.removeTeacher(selectedSectionSubject);
                if (deleted) {
                    let _sectionSubjects = [...sectionSubjects];
                    const index = sectionSubjects.findIndex((sub) => sub._id === selectedSectionSubject._id);
                    _sectionSubjects[index] = { ...selectedSectionSubject, teacher: undefined };
                    setSectionSubjects(_sectionSubjects);
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
                summary: 'Failed to remove class',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setShowRemoveDialog(false);
            setSelectedSectionSubject(emptySectionSubject);
        }
    }

    const openTeacherDialog = (sectionSubject: SectionSubject) => {
        setSelectedSectionSubject(sectionSubject);
        setSubmitted(false);
        setShowTeacherDialog(true);
    };

    const hideTeacherDialog = () => {
        setSubmitted(false);
        setSelectedSectionSubject(emptySectionSubject);
        setShowTeacherDialog(false);
    };
    const teacherDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideTeacherDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveTeacherClass} />
        </>
    );

    const confirmRemoveSectionClass = (sectionSubject: SectionSubject) => {
        setSelectedSectionSubject(sectionSubject);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={removeTeacherClass} />
        </>
    );


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Alloacte Teachers</h5>
        </div>
    );



    const actionBodyTemplate = (rowData: SectionSubject) => {
        return (
            <>
                <Button tooltip="Assign Teacher" icon="pi pi-user" rounded severity="info" style={{ marginRight: '10px' }} onClick={() => openTeacherDialog(rowData)} />
                <Button icon="pi pi-times" rounded severity="warning" onClick={() => confirmRemoveSectionClass(rowData)} />
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <div className="card p-fluid">
                        <div className="grid">
                            <div className="col-12">
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <label htmlFor="section">Section</label>
                                        <div id="section">
                                            <Dropdown
                                                value={selectedGradeSection || null}
                                                onChange={(e) =>
                                                    setSelectedGradeSection(e.value)
                                                }
                                                options={gradeSections.map((item) => ({
                                                    ...item,
                                                    section_number: `Section ${item.section_number}`,
                                                }))}
                                                optionLabel="section_number"
                                                placeholder="Select Section"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DataTable
                        header={header}
                        value={sectionSubjects}
                        selection={selectedSectionSubject}
                        onSelectionChange={(e) => setSelectedSectionSubject(e.value)}
                        dataKey="_id"
                        emptyMessage={`No class for ${selectedGradeSection?._id} section found.`}
                        paginator
                        rows={15}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>

                        <Column field="grade_subject.subject.title" header="Subject" sortable headerStyle={{ minWidth: '10rem' }}></Column>

                        <Column header="Teacher" field="teacher.first_name" body={(rowData) =>
                            rowData.teacher
                                ? `${rowData.teacher.sex === 'Male' ? 'Mr.' : 'Miss'} ${rowData.teacher.first_name} ${rowData.teacher.last_name}`
                                : 'N/A'
                        } sortable headerStyle={{ minWidth: '10rem' }}></Column>

                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showTeacherDialog}
                        style={{ width: '450px' }}
                        header={selectedSectionSubject._id ? 'Allocate Teacher' : ''}
                        modal
                        className="p-fluid"
                        footer={teacherDialogFooter}
                        onHide={hideTeacherDialog}                    >
                        {selectedSectionSubject._id ?
                            <div className="field">
                                <label htmlFor="teacher">Teacher</label>
                                <div id="teacher">
                                    <Dropdown
                                        value={selectedSectionSubject?.teacher}
                                        options={teachers}
                                        onChange={(e) => setSelectedSectionSubject({ ...selectedSectionSubject, teacher: e.value })}
                                        placeholder="Select a Teacher"
                                        optionLabel="_id"
                                        itemTemplate={teacherTemplate}
                                        valueTemplate={teacherTemplate}
                                        filter
                                        required
                                        emptyMessage="No Teachers Found."
                                        className={classNames({
                                            'p-invalid': submitted && !selectedSectionSubject.teacher,
                                        })}
                                    />
                                    {submitted && !selectedSectionSubject.teacher && <small className="p-invalid">Teacher is required.</small>}
                                </div>
                            </div>
                            : <></>
                        }
                    </Dialog>

                    <Dialog
                        visible={showRemoveDialog}
                        style={{ width: '450px' }}
                        header="Confirm to Remove Teacher Class"
                        modal
                        footer={removeDialogFooter}
                        onHide={hideRemoveDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedSectionSubject.teacher && (
                                <span>
                                    Are you sure you want to remove <b>{(selectedSectionSubject.teacher as Teacher).first_name}</b> from class?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default TeacherClassPage;