'use client';
import { GradeSubjectService } from "@/services/GradeSubjectService";
import { SectionClassService } from "@/services/SectionClassService";
import { ClassificationGrade, CurriculumGrade, GradeSection, GradeSubject, SectionClass } from "@/types/model";
import { gradeSubjectTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";
import { useClassificationGrade } from "../../contexts/classificationGradeContext";

interface SectionClassProps {
    gradeSection: GradeSection;
}
const SectionClassComponent = (props: SectionClassProps) => {

    let emptySectionClass: SectionClass = {
        grade_section: props.gradeSection,
        subject_term: ''
    };
    const { selectedClassificationGrade } = useClassificationGrade();
    const [sectionClasss, setSectionClasss] = useState<SectionClass[]>([]);
    const [selectedSectionClass, setSelectedSectionClass] = useState<SectionClass>(emptySectionClass);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const [gradeSubjects, setGradeSubjects] = useState<GradeSubject[]>([]);



    useEffect(() => {
        if (selectedClassificationGrade) {
            GradeSubjectService.getGradeSubjectsByCurriculumGrade(selectedClassificationGrade.curriculum_grade as CurriculumGrade).then((data) => {
                setGradeSubjects(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load grade subjects',
                    detail: '' + err,
                    life: 3000
                });
            }).finally();
            SectionClassService.getSectionClasssByGradeSection(props.gradeSection).then((data) => {
                setSectionClasss(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load section class',
                    detail: '' + err,
                    life: 3000
                });
            }).finally();
        }
    }, [selectedClassificationGrade]);


    const validateSectionClass = (section_class: SectionClass) => {
        if (!section_class.grade_section || !section_class.subject_term) {
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
            const newSectionClass = await SectionClassService.createSectionClass(selectedSectionClass);
            if (newSectionClass) {
                const sectionclass = { ...selectedSectionClass, _id: newSectionClass._id }
                _sectionClasss.push(sectionclass);
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
        setSelectedSectionClass(emptySectionClass);
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


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h6 className="m-0">Manage Section Classes</h6>
            <span className="block mt-2 md:mt-0">
                <div className="my-2">
                    <Button label="Add Subject" icon="pi pi-plus" className="mr-2" onClick={openSaveDialog} />
                </div>
            </span>
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
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveSectionClass(rowData)} />
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
                        value={sectionClasss}
                        selection={selectedSectionClass}
                        onSelectionChange={(e) => setSelectedSectionClass(e.value)}
                        dataKey="_id"
                        emptyMessage={`No class for section ${props.gradeSection.section_number} found.`}
                        paginator
                        rows={15}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="subject_term.grade_subject.subject.title" header="Subject" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="subject_term.term" header="Term" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showAddDialog}
                        style={{ width: '450px' }}
                        header={'Subject'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideAddDialog}>
                        <div className="field">
                            <label htmlFor="subject">Subject</label>
                            <div id="subject">
                                <Dropdown
                                    value={selectedSectionClass.subject_term}
                                    options={gradeSubjects}
                                    onChange={(e) => setSelectedSectionClass({ ...selectedSectionClass, subject_term: e.value })}
                                    placeholder="Select a Subject"
                                    optionLabel="_id"
                                    itemTemplate={gradeSubjectTemplate}
                                    valueTemplate={gradeSubjectTemplate}
                                    filter
                                    required
                                    autoFocus
                                    emptyMessage="No Subjects Found."
                                    className={classNames({
                                        'p-invalid': submitted && !selectedSectionClass.subject_term,
                                    })}
                                />
                                {submitted && !selectedSectionClass.subject_term && <small className="p-invalid">Subject is required.</small>}
                            </div>
                        </div>
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