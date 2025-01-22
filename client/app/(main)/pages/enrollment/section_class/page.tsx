'use client';
import { useClassificationGrade } from "@/app/(main)/contexts/classificationGradeContext";
import { GradeSectionService } from "@/services/GradeSectionService";
import { GradeSubjectService } from "@/services/GradeSubjectService";
import { SectionClassService } from "@/services/SectionClassService";
import { TeacherService } from "@/services/TeacherService";
import { GradeSection, GradeSubject, SectionClass, Teacher } from "@/types/model";
import { gradeSectionTemplate, gradeSubjectTemplate, teacherTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";


const SectionClassComponent = () => {

    let emptySectionClass: SectionClass = {
        grade_section: '',
        grade_subject: ''
    };
    const { selectedClassificationGrade } = useClassificationGrade();
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const [sectionClasss, setSectionClasss] = useState<SectionClass[]>([]);
    const [selectedSectionClass, setSelectedSectionClass] = useState<SectionClass>(emptySectionClass);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [gradeSubjects, setGradeSubjects] = useState<GradeSubject[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        loadTeachers();
    }, []);

    useEffect(() => {
        try {
            if (selectedClassificationGrade) {
                GradeSectionService.getGradeSectionsByClassificationGrade(selectedClassificationGrade).then((data) => {
                    setGradeSections(data);
                });
                if (typeof selectedClassificationGrade.curriculum_grade === 'object') {
                    GradeSubjectService.getGradeSubjectsByCurriculumGrade(selectedClassificationGrade.curriculum_grade).then((data) => {
                        setGradeSubjects(data);
                        //console.log(data);
                    });
                }
                setSelectedGradeSection(null);
            }
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load sections',
                detail: '' + err,
                life: 3000
            });
        }
    }, [selectedClassificationGrade]);

    useEffect(() => {
        try {
            if (selectedGradeSection) {
                SectionClassService.getSectionClasssByGradeSection(selectedGradeSection).then((data) => {
                    setSectionClasss(data);
                    //console.log(data);
                });
            } else {
                setSectionClasss([])
            }
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load section class',
                detail: '' + err,
                life: 3000
            });
        }
    }, [selectedGradeSection]);


    const loadTeachers = async () => {
        try {
            TeacherService.getTeachers().then((data) => {
                setTeachers(data);
            });
        } catch (err) {
            //console.error('Failed to load teachers:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to Load Teachers',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const syncSubjects = async () => { }

    const validateSectionClass = (section_class: SectionClass) => {
        if (!section_class.grade_section || !section_class.grade_subject) {
            return false;
        }
        return true;
    };

    const validateSectionClassTeacher = (section_class: SectionClass) => {
        if (!section_class.teacher) {
            return false;
        }
        return true;
    };

    const saveSectionClass = async () => {
        setSubmitted(true);
        if (!validateSectionClass(selectedSectionClass)) {
            return
        }
        let _sectionClasss = [...(sectionClasss as any)];
        try {
            if (selectedSectionClass._id) {
                if (!validateSectionClassTeacher(selectedSectionClass)) {
                    return
                }
                let id = selectedSectionClass._id;
                const updatedClass = await SectionClassService.updateSectionClass(id, selectedSectionClass);
                const teacherObject = teachers.find(
                    (teacher) => teacher._id === updatedClass.teacher
                );
                if (teacherObject) {
                    const updatedSectionClass = {
                        ...selectedSectionClass,
                        teacher: teacherObject,
                    };
                    const index = findIndexById(id);
                    _sectionClasss[index] = updatedSectionClass;
                }
            } else {
                const newSectionClass = await SectionClassService.createSectionClass(selectedSectionClass);
                if (newSectionClass) {
                    const sectionclass = { ...selectedSectionClass, _id: newSectionClass._id }
                    _sectionClasss.push(sectionclass);
                }

            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `Class ${selectedSectionClass._id ? 'Updated' : 'Created'}`,
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
        setSectionClasss(_sectionClasss);
        setShowAddDialog(false);
        setSelectedSectionClass(emptySectionClass);
    }
    const deleteSectionClass = async () => {
        try {
            if (selectedSectionClass._id) {
                const deleted = await SectionClassService.deleteSectionClass(selectedSectionClass._id);
                if (deleted) {
                    let _sectionClasss = (sectionClasss as any)?.filter((val: any) => val._id !== selectedSectionClass._id);
                    setSectionClasss(_sectionClasss);
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
        }
        setShowRemoveDialog(false);
        setSelectedSectionClass(emptySectionClass);
    }

    const openSaveDialog = () => {
        if (selectedGradeSection) {
            setSelectedSectionClass({ ...emptySectionClass, grade_section: selectedGradeSection });
            setSubmitted(false);
            setShowAddDialog(true);
        }
    };

    const openEditDialog = (sectionClass: SectionClass) => {
        setSelectedSectionClass(sectionClass);
        setSubmitted(false);
        setShowAddDialog(true);
    };

    const hideAddDialog = () => {
        setSubmitted(false);
        setShowAddDialog(false);
    };
    const saveDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideAddDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveSectionClass} />
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
            <Button label="Delete" icon="pi pi-check" text onClick={deleteSectionClass} />
        </>
    );

    const startToolbarTemplate = () => {
        return (
            <div className="field">
                <div id="section">
                    <Dropdown
                        value={selectedGradeSection}
                        onChange={(e) =>
                            setSelectedGradeSection(e.value)
                        }
                        options={gradeSections}
                        itemTemplate={gradeSectionTemplate}
                        valueTemplate={gradeSectionTemplate}
                        optionLabel="section"
                        placeholder="Select Section"
                    />
                </div>
            </div>

        );
    };

    const endToolbarTemplate = () => {
        return (
            <div className="my-2">
                <Button label="Add Subject" icon="pi pi-plus" className="mr-2" onClick={openSaveDialog} disabled={!selectedGradeSection} />
                <Button label="Sync" icon="pi pi-sync" raised severity="secondary" loading={loading} rounded className="mr-2" onClick={syncSubjects} />
            </div>
        );
    };

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
                <Button icon="pi pi-user" rounded severity="info" style={{ marginRight: '10px' }} onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveSectionClass(rowData)} />
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate} end={endToolbarTemplate}></Toolbar>
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
                        <Column field="grade_subject.subject.title" header="Subject" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column header="Teacher" body={teacherBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showAddDialog}
                        style={{ width: '450px' }}
                        header={selectedSectionClass._id ? 'Teacher' : 'Subject'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideAddDialog}                    >
                        {selectedSectionClass ?
                            selectedSectionClass._id ? <>
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
                            </> :
                                <div className="field">
                                    <label htmlFor="subject">Subject</label>
                                    <div id="subject">
                                        <Dropdown
                                            value={selectedSectionClass.grade_subject}
                                            options={gradeSubjects}
                                            onChange={(e) => setSelectedSectionClass({ ...selectedSectionClass, grade_subject: e.value })}
                                            placeholder="Select a Subject"
                                            optionLabel="_id"
                                            itemTemplate={gradeSubjectTemplate}
                                            valueTemplate={gradeSubjectTemplate}
                                            filter
                                            required
                                            autoFocus
                                            emptyMessage="No Subjects Found."
                                            className={classNames({
                                                'p-invalid': submitted && !selectedSectionClass.grade_subject,
                                            })}
                                        />
                                        {submitted && !selectedSectionClass.grade_subject && <small className="p-invalid">Subject is required.</small>}
                                    </div>
                                </div>
                            : <></>
                        }
                    </Dialog>

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
                            {selectedSectionClass && (
                                <span>
                                    Are you sure you want to delete <b>{selectedSectionClass._id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default SectionClassComponent;