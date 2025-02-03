'use client';
import { useClassificationGrade } from "@/app/(main)/contexts/classificationGradeContext";
import { GradeSectionService } from "@/services/GradeSectionService";
import { SectionClassService } from "@/services/SectionClassService";
import { TeacherService } from "@/services/TeacherService";
import { GradeSection, GradeSubject, SectionClass, SubjectTerm, Teacher } from "@/types/model";
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

    let emptySectionClass: SectionClass = {
        grade_section: '',
        subject_term: '',
        status: 'ACTIVE',
        teacher: ''
    };
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const { selectedClassificationGrade } = useClassificationGrade();
    const [sectionClasss, setSectionClasss] = useState<SectionClass[]>([]);
    const [selectedSectionClass, setSelectedSectionClass] = useState<SectionClass>(emptySectionClass);
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
            setLoading(true);
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
                setLoading(false);
            });
        }
    }, [selectedClassificationGrade]);

    useEffect(() => {
        if (selectedGradeSection) {
            SectionClassService.getSectionClasssByGradeSection(selectedGradeSection).then((data) => {
                setSectionClasss(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load section class',
                    detail: '' + err,
                    life: 3000
                });
            });
        }
    }, [selectedGradeSection]);




    const saveTeacherClass = async () => {
        setSubmitted(true);
        if (!selectedSectionClass.teacher) {
            return
        }
        try {
            let _sectionClasss = [...sectionClasss];
            if (selectedSectionClass._id) {
                const data = await SectionClassService.allocateTeacher(selectedSectionClass);
                if (data > 0) {
                    for (let i = 0; i < _sectionClasss.length; i++) {
                        if (((sectionClasss[i].subject_term as SubjectTerm).grade_subject as GradeSubject)._id === ((selectedSectionClass.subject_term as SubjectTerm).grade_subject as GradeSubject)._id) {
                            _sectionClasss[i] = { ..._sectionClasss[i], teacher: selectedSectionClass.teacher }
                        }
                    }
                }
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Teacher Allocated',
                    life: 1500
                });
                setSectionClasss(_sectionClasss);
            }
        } catch (error) {
            //console.log(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to allocate teacher',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setShowTeacherDialog(false);
            setSelectedSectionClass(emptySectionClass);
        }
    }
    const removeTeacherClass = async () => {
        try {
            if (selectedSectionClass._id) {
                const deleted = await SectionClassService.removeTeacherClass(selectedSectionClass);
                if (deleted) {
                    let _sectionClasss = [...sectionClasss];
                    for (let i = 0; i < _sectionClasss.length; i++) {
                        if (
                            ((sectionClasss[i].subject_term as SubjectTerm).grade_subject as GradeSubject)._id ===
                            ((selectedSectionClass.subject_term as SubjectTerm).grade_subject as GradeSubject)._id
                        ) {
                            _sectionClasss[i] = { ..._sectionClasss[i], teacher: undefined };
                        }
                    }
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Class Deleted',
                        life: 1500
                    });
                    setSectionClasss(_sectionClasss);
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
            setSelectedSectionClass(emptySectionClass);
        }
    }

    const openTeacherDialog = (sectionClass: SectionClass) => {
        setSelectedSectionClass(sectionClass);
        setSubmitted(false);
        setShowTeacherDialog(true);
    };

    const hideTeacherDialog = () => {
        setSubmitted(false);
        setSelectedSectionClass(emptySectionClass);
        setShowTeacherDialog(false);
    };
    const teacherDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideTeacherDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveTeacherClass} />
        </>
    );

    const confirmRemoveSectionClass = (sectionClass: SectionClass) => {
        setSelectedSectionClass(sectionClass);
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

    const teacherBodyTemplate = (rowData: SectionClass) => {
        return (<>
            {typeof rowData.teacher === 'string' ? (
                rowData.teacher || 'N/A'
            ) : rowData.teacher && typeof rowData.teacher === 'object' ? (
                rowData.teacher.first_name + " " + rowData.teacher.last_name || 'N/A'
            ) : (
                'N/A'
            )}
        </>);
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (sectionClasss as any)?.length; i++) {
            if ((sectionClasss as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const actionBodyTemplate = (rowData: SectionClass) => {
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
                        value={sectionClasss}
                        selection={selectedSectionClass}
                        onSelectionChange={(e) => setSelectedSectionClass(e.value)}
                        dataKey="_id"
                        emptyMessage={`No class for ${selectedGradeSection?._id} section found.`}
                        paginator
                        rows={15}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="subject_term.grade_subject.subject.title" header="Subject" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Status" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column header="Teacher" body={teacherBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showTeacherDialog}
                        style={{ width: '450px' }}
                        header={selectedSectionClass._id ? 'Allocate Teacher' : ''}
                        modal
                        className="p-fluid"
                        footer={teacherDialogFooter}
                        onHide={hideTeacherDialog}                    >
                        {selectedSectionClass._id ?
                            <div className="field">
                                <label htmlFor="teacher">Teacher</label>
                                <div id="teacher">
                                    <Dropdown
                                        value={selectedSectionClass.teacher}
                                        options={teachers}
                                        onChange={(e) => setSelectedSectionClass({ ...selectedSectionClass, teacher: e.value })}
                                        placeholder="Select a Teacher"
                                        optionLabel="_id"
                                        itemTemplate={teacherTemplate}
                                        valueTemplate={teacherTemplate}
                                        filter
                                        required
                                        emptyMessage="No Teachers Found."
                                        className={classNames({
                                            'p-invalid': submitted && !selectedSectionClass.teacher,
                                        })}
                                    />
                                    {submitted && !selectedSectionClass.teacher && <small className="p-invalid">Teacher is required.</small>}
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
                            {selectedSectionClass && (
                                <span>
                                    Are you sure you want to remove <b>{teacherBodyTemplate(selectedSectionClass)}</b> from class?
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