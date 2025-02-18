'use client';
import SectionClassComponent from "@/app/(main)/components/section_classes/page";
import { useClassificationGrade } from "@/app/(main)/contexts/classificationGradeContext";
import { GradeSectionService } from "@/services/GradeSectionService";
import { TeacherService } from "@/services/TeacherService";
import { GradeSection, Teacher } from "@/types/model";
import { teacherTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";

const GradeSectionPage = () => {

    let emptyGradeSection: GradeSection = {
        classification_grade: '',
        section_number: 1,
        number_of_seat: 60,
        status: 'OPEN'
    };
    const { selectedClassificationGrade } = useClassificationGrade();
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection>(emptyGradeSection);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const [expandedClassRows, setExpandedClassRows] = useState<any[] | DataTableExpandedRows>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

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
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load sections',
                    detail: '' + err,
                    life: 3000
                });
            });
        }

    }, [selectedClassificationGrade]);


    const validateGradeSection = (section: GradeSection) => {
        if (!section.classification_grade || isNaN(section.section_number) || section.section_number <= 0
            || isNaN(section.number_of_seat) || section.number_of_seat <= 0) {
            return false;
        }
        return true;
    };

    const saveGradeSection = async () => {
        setSubmitted(true);
        if (!validateGradeSection(selectedGradeSection)) {
            return
        }
        let _gradeSections = [...(gradeSections as any)];
        try {
            if (selectedGradeSection._id) {
                const updatedSection = await GradeSectionService.updateGradeSection(selectedGradeSection);
                if (updatedSection) {
                    const index = gradeSections.findIndex((sec) => sec._id === updatedSection._id);
                    _gradeSections[index] = selectedGradeSection;
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Section Updated',
                        life: 1500
                    });
                }
            } else {
                const newGradeSection = await GradeSectionService.createGradeSection(selectedGradeSection);
                if (newGradeSection._id) {
                    _gradeSections.push({ ...selectedGradeSection, _id: newGradeSection._id });
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Section Created',
                        life: 1500
                    });
                }
            }

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to manipulat section',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setGradeSections(_gradeSections);
            setShowAddDialog(false);
            setSelectedGradeSection(emptyGradeSection);
        }

    }
    const deleteGradeSection = async () => {
        try {
            const deleted = await GradeSectionService.deleteGradeSection(selectedGradeSection._id ?? '');
            if (deleted) {
                let _gradeSections = (gradeSections as any)?.filter((val: any) => val._id !== selectedGradeSection._id);
                setGradeSections(_gradeSections);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Section Deleted',
                    life: 1500
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to remove section',
                detail: '' + error,
                life: 1500
            });
        }
        setShowRemoveDialog(false);
        setSelectedGradeSection(emptyGradeSection);
    }


    const openAddDialog = () => {
        let max_section = 0;
        for (let i = 0; i < gradeSections?.length; i++) {
            if ((gradeSections)[i].section_number > max_section) {
                max_section = gradeSections[i].section_number;
            }
        }
        if (selectedClassificationGrade) {
            setSelectedGradeSection({ ...emptyGradeSection, classification_grade: selectedClassificationGrade, section_number: max_section + 1 });
            setSubmitted(false);
            setShowAddDialog(true);
        }
    };

    const openEditDialog = (gradeSection: GradeSection) => {
        setSelectedGradeSection({ ...gradeSection });
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
            <Button label="Save" icon="pi pi-check" text onClick={saveGradeSection} />
        </>
    );

    const confirmRemoveGradeSection = (gradeSection: GradeSection) => {
        setSelectedGradeSection(gradeSection);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteGradeSection} />
        </>
    );


    const getSeverity = (value: GradeSection) => {
        switch (value.status) {
            case 'OPEN':
                return 'success';

            case 'CLOSED':
                return 'info';

            default:
                return null;
        }
    };

    const statusBodyTemplate = (rowData: GradeSection) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData)}></Tag>;
    };


    const startToolbarTemplate = () => {
        return (
            <div className="my-2">
                <Button label="Create Section" icon="pi pi-plus" className="mr-2" severity="success" onClick={openAddDialog} disabled={!selectedClassificationGrade || selectedClassificationGrade.status === 'CLOSED'} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Sections</h5>
        </div>
    );


    const actionBodyTemplate = (rowData: GradeSection) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveGradeSection(rowData)} />
            </>
        );
    };

    const handleUpdateSection = (updatedSection: GradeSection) => {
        let _gradeSections = [...gradeSections]
        const index = gradeSections.findIndex((sec) => sec._id === updatedSection._id);
        _gradeSections[index] = { ...updatedSection };
        setGradeSections(_gradeSections);
    };


    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
                    <DataTable
                        header={header}
                        value={gradeSections}
                        selection={selectedGradeSection}
                        onSelectionChange={(e) => setSelectedGradeSection(e.value)}
                        dataKey="_id"
                        emptyMessage={'No sections data for the grade found.'}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} grades"
                        expandedRows={expandedClassRows}
                        onRowToggle={(e) => setExpandedClassRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <SectionClassComponent
                                classificationGrade={selectedClassificationGrade}
                                gradeSection={data as GradeSection}
                                onUpdate={handleUpdateSection}
                            />
                        )}
                    >
                        <Column expander style={{ width: '4em' }} />
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="section_number" header="Section" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="number_of_seat" header="Capacity" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column header="Home Teacher" field="home_teacher.first_name" body={(rowData) =>
                            rowData.home_teacher
                                ? `${rowData.home_teacher.sex === 'Male' ? 'Mr.' : 'Miss'} ${rowData.home_teacher.first_name} ${rowData.home_teacher.last_name}`
                                : 'N/A'
                        } sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showAddDialog}
                        style={{ width: '450px' }}
                        header="Add Section"
                        modal
                        className="p-fluid"
                        footer={addDialogFooter}
                        onHide={hideAddDialog}                    >
                        {selectedGradeSection ? <>
                            <div className="field">
                                <label htmlFor="section_number">Section Number</label>
                                <div id="section_number">
                                    <InputNumber
                                        id="section_number"
                                        value={selectedGradeSection.section_number}
                                        onChange={(e) => setSelectedGradeSection({ ...selectedGradeSection, section_number: e.value || 1 })}
                                        mode="decimal" // Basic number mode
                                        useGrouping={false} // No thousand separator
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !selectedGradeSection.section_number,
                                        })}
                                    />
                                </div>
                                {submitted && !selectedGradeSection.section_number && <small className="p-invalid">Section Number is required.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="number_of_seat">Capacity</label>
                                <div id="number_of_seat">
                                    <InputNumber
                                        id="number_of_seat"
                                        value={selectedGradeSection.number_of_seat}
                                        onChange={(e) => setSelectedGradeSection({ ...selectedGradeSection, number_of_seat: e.value || 60 })}
                                        mode="decimal"
                                        min={5}
                                        useGrouping={false}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !selectedGradeSection.number_of_seat,
                                        })}
                                    />
                                </div>
                                {submitted && !selectedGradeSection.number_of_seat && <small className="p-invalid">Number of Seat is required.</small>}
                            </div>

                            <div className="field">
                                <label htmlFor="home_teacher">Teacher</label>
                                <div id="home_teacher">
                                    <Dropdown
                                        value={selectedGradeSection?.home_teacher}
                                        options={teachers}
                                        onChange={(e) => setSelectedGradeSection({ ...selectedGradeSection, home_teacher: e.value })}
                                        placeholder="Select a Teacher"
                                        optionLabel="_id"
                                        itemTemplate={teacherTemplate}
                                        valueTemplate={teacherTemplate}
                                        filter
                                        required
                                        emptyMessage="No Teachers Found."
                                    />
                                </div>
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
                            {selectedGradeSection && (
                                <span>
                                    Are you sure you want to delete <b>{selectedGradeSection._id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default GradeSectionPage;