'use client';
import SectionClassComponent from "@/app/(main)/components/section_classes/page";
import { useClassificationGrade } from "@/app/(main)/contexts/classificationGradeContext";
import { GradeSectionService } from "@/services/GradeSectionService";
import { GradeSection } from "@/types/model";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";

const GradeSectionComponent = () => {

    let emptyGradeSection: GradeSection = {
        classification_grade: '',
        section_number: 0,
        status:'OPEN'
    };
    const { selectedClassificationGrade } = useClassificationGrade();
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection>(emptyGradeSection);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const [expandedClassRows, setExpandedClassRows] = useState<any[] | DataTableExpandedRows>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            if (selectedClassificationGrade) {
                GradeSectionService.getGradeSectionsByClassificationGrade(selectedClassificationGrade).then((data) => {
                    setGradeSections(data);
                });
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


    const validateGradeSection = (section: GradeSection) => {
        if (!section.classification_grade || isNaN(section.section_number) || section.section_number <= 0) {
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
            const newGradeSection = await GradeSectionService.createGradeSection(selectedGradeSection);
            // _gradeSections.push({ ...selectedGradeSection, _id: newGradeSection._id });
            _gradeSections.push(newGradeSection);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Section Created',
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
        setGradeSections(_gradeSections);
        setShowAddDialog(false);
        setSelectedGradeSection(emptyGradeSection);
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

    const syncSubjects = async () => {
        try {
            if (!selectedClassificationGrade) {
                throw Error("Classification Grade Required");
            }
            setLoading(true);
            const sync_data: any[] = await GradeSectionService.syncSectionClasses(selectedClassificationGrade);
            if (sync_data.length > 0) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: `${sync_data.length} section classes synced`,
                    life: 3000
                });
            } else {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sync Classes',
                    detail: "Nothing synced. Already up to date.",
                    life: 3000
                });
            }

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to sync',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
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

    const hideAddDialog = () => {
        setSubmitted(false);
        setShowAddDialog(false);
    };
    const addDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideAddDialog} />
            <Button label="Add" icon="pi pi-check" text onClick={saveGradeSection} />
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

    const startToolbarTemplate = () => {
        return (
            <div className="my-2">
                <Button label="Create Section" icon="pi pi-plus" className="mr-2" onClick={openAddDialog} disabled={!selectedClassificationGrade} />
            </div>
        );
    };

    const endToolbarTemplate = () => {
        return (
            <div className="my-2">
                <Button tooltip="Sync Grade Subjects" icon="pi pi-sync" raised severity="secondary" loading={loading} rounded className="mr-2" onClick={syncSubjects} />
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
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveGradeSection(rowData)} />
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
                        value={gradeSections}
                        selection={selectedGradeSection}
                        onSelectionChange={(e) => setSelectedGradeSection(e.value)}
                        dataKey="_id"
                        emptyMessage={`No section for ${selectedClassificationGrade?.curriculum_grade} grade found.`}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} grades"
                        expandedRows={expandedClassRows}
                        onRowToggle={(e) => setExpandedClassRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <SectionClassComponent
                                gradeSection={data as GradeSection}
                            />
                        )}
                    >
                        <Column expander style={{ width: '4em' }} />
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="section_number" header="Section" sortable headerStyle={{ minWidth: '10rem' }}></Column>
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
                                <label htmlFor="section">Section Number</label>
                                <div id="section">
                                    <InputNumber
                                        id="section"
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

export default GradeSectionComponent;