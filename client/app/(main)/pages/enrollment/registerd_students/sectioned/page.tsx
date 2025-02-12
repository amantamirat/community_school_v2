'use client';
import StudentClassComponent from '@/app/(main)/components/student_classes/page';
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { StudentClassService } from '@/services/StudentClassService';
import { StudentGradeService } from '@/services/StudentGradeService';
import { GradeSection, StudentGrade } from '@/types/model';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';

const SectionedStudentsPage = () => {
    const toast = useRef<Toast>(null);
    const { selectedClassificationGrade } = useClassificationGrade();
    const [selectedRegisteredStudents, setSelectedRegisteredStudents] = useState<StudentGrade[]>([]);
    const [registeredStudents, setRegisteredStudents] = useState<StudentGrade[]>([]);
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDetachSectionDialog, setShowDetachSectionDialog] = useState(false);
    const [expandedClassRows, setExpandedClassRows] = useState<any[] | DataTableExpandedRows>([]);

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
                setSelectedRegisteredStudents([]);
            });
        }
    }, [selectedClassificationGrade]);


    useEffect(() => {
        if (selectedGradeSection) {
            setLoading(true);
            StudentGradeService.getSectionedRegisteredStudents(selectedGradeSection).then((data) => {
                setRegisteredStudents(data);
            }).catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed Load Sectioned Students',
                    detail: '' + error,
                    life: 3000
                });
            }).finally(() => {
                setLoading(false);
                setSelectedRegisteredStudents([]);
            });
        }
    }, [selectedGradeSection]);


    const detachSectionStudents = async () => {
        if (!selectedGradeSection?._id || selectedRegisteredStudents.length == 0) {
            return
        }
        try {
            setLoading(true);
            const data = await StudentGradeService.detachSectionStudents(selectedGradeSection, selectedRegisteredStudents);
            if (data.acknowledged) {
                let _data = registeredStudents.filter(student =>
                    !selectedRegisteredStudents.some(
                        selected => selected._id && selected._id.toString() === student._id && student._id.toString()
                    )
                );
                setRegisteredStudents(_data);
                setSelectedRegisteredStudents([]);
            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Section Removed!',
                life: 1500
            });
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to remove section',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
        setShowDetachSectionDialog(false);
    }


    const syncStudClasses = async () => {
        try {
            if (!selectedGradeSection) {
                throw Error("Section Required");
            }
            if(selectedGradeSection.status==="CLOSED"){
                throw Error("Section CLOSED");
            }
            setLoading(true);
            const sync_data: any[] = await StudentClassService.syncStudentClasses(selectedGradeSection);
            if (sync_data.length > 0) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: `${sync_data.length} student classes synced`,
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

    const openDetachSectionDialog = () => {
        setShowDetachSectionDialog(true);
    };

    const hideDetachSectionDialog = () => {
        setShowDetachSectionDialog(false);
    };

    const detachSectionDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDetachSectionDialog} />
            <Button label="Detach" icon="pi pi-check" text onClick={detachSectionStudents} />
        </>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Section Students</h5>
            <span className="block mt-2 md:mt-0">
                <div className="my-2">
                    <Button
                        label="Detach Section"
                        icon="pi pi-fw pi-times-circle"
                        severity="danger"
                        className="mr-2"
                        disabled={selectedRegisteredStudents.length === 0}
                        onClick={openDetachSectionDialog}
                    />
                    <Button tooltip="Fix Classes" icon="pi pi-sync" raised severity="secondary" loading={loading} rounded className="mr-2" onClick={syncStudClasses} />
                </div>
            </span>
        </div>
    );

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
                        value={registeredStudents}
                        dataKey="_id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                        emptyMessage="No students found."
                        scrollable
                        selectionMode="multiple"
                        selection={selectedRegisteredStudents}
                        loading={loading}
                        onSelectionChange={(e) => setSelectedRegisteredStudents(e.value as any)}
                        expandedRows={expandedClassRows}
                        onRowToggle={(e) => setExpandedClassRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <StudentClassComponent
                                student_grade={data as StudentGrade}
                            />
                        )}
                    >
                        <Column expander style={{ width: '4em' }} />
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }} />
                        <Column header="#" body={(rowData, options) => options.rowIndex + 1} style={{ width: '50px' }} />
                        <Column field="student.first_name" header="Student" body={(rowData) => `${rowData.student.first_name} ${rowData.student.last_name}`} sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="student.sex" header="Gender" sortable headerStyle={{ minWidth: '5rem' }} />
                        <Column field="student.birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '10rem' }}
                            body={(rowData) => new Date(rowData.student.birth_date).toLocaleDateString('en-GB')} />
                        {selectedClassificationGrade?.status === 'CLOSED' && <Column field="average_result" header="Average" sortable headerStyle={{ minWidth: '5rem' }}></Column>}
                        <Column field="status" header="Status" sortable headerStyle={{ minWidth: '5rem' }} />
                    </DataTable>
                    <Dialog
                        visible={showDetachSectionDialog}
                        style={{ width: '450px' }}
                        header="Confirm-Detach Section"
                        modal
                        footer={detachSectionDialogFooter}
                        onHide={hideDetachSectionDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedRegisteredStudents.length > 0 && (
                                <span>
                                    Are you sure you want to detach section for <b>{selectedRegisteredStudents.length}</b> students?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default SectionedStudentsPage;
