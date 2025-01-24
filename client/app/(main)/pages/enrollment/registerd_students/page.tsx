'use client';
import StudentClassComponent from '@/app/(main)/components/student_classes/page';
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { StudentGradeService } from '@/services/StudentGradeService';
import { GradeSection, StudentGrade } from '@/types/model';
import { gradeSectionTemplate, studentGradeTemplate } from '@/types/templates';
import { FilterMatchMode, PrimeIcons } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';

const RegisteredStudentsComponent = () => {
    const toast = useRef<Toast>(null);
    const { selectedClassificationGrade } = useClassificationGrade();
    const [selectedRegisteredStudents, setSelectedRegisteredStudents] = useState<StudentGrade[]>([]);
    const [registeredStudents, setRegisteredStudents] = useState<StudentGrade[]>([]);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [gradeSection, setGradeSection] = useState<GradeSection>();
    const [showSectionDialog, setShowSectionDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const [showDeregisterDialog, setShowDeregisterDialog] = useState(false);
    const [showDetachSectionDialog, setShowDetachSectionDialog] = useState(false);
    const [expandedClassRows, setExpandedClassRows] = useState<any[] | DataTableExpandedRows>([]);


    useEffect(() => {
        initFilters();
    }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        });
        setGlobalFilter('');
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        (_filters['global'] as any).value = value;
        setFilters(_filters);
        setGlobalFilter(value);
    };

    useEffect(() => {
        try {
            if (selectedClassificationGrade) {
                setLoading(true);
                setSelectedRegisteredStudents([]);
                StudentGradeService.getRegisteredStudents(selectedClassificationGrade).then((data) => {
                    setRegisteredStudents(data);
                    setLoading(false);
                });
                GradeSectionService.getGradeSectionsByClassificationGrade(selectedClassificationGrade).then((data) => {
                    const nullOption: GradeSection = {
                        _id: undefined, // Optional
                        classification_grade: selectedClassificationGrade, // Use the current grade for context
                        section_number: NaN, // Or any value indicating "None"
                    };
                    setGradeSections([nullOption, ...data]);
                    //setGradeSections(data);
                });
            }
        } catch (error) {
            setLoading(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed Load Registred Students',
                detail: '' + error,
                life: 3000
            });
        }
    }, [selectedClassificationGrade]);


    useEffect(() => {
        try {
            if (selectedGradeSection) {
                setLoading(true);
                setSelectedRegisteredStudents([]);
                StudentGradeService.getSectionedRegisteredStudents(selectedGradeSection).then((data) => {
                    setRegisteredStudents(data);
                    setLoading(false);
                });
            }
        } catch (error) {
            setLoading(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed Load Registred Students',
                detail: '' + error,
                life: 3000
            });
        }
    }, [selectedGradeSection]);

    const deregisterStudents = async () => {
        try {
            if (selectedClassificationGrade) {
                await StudentGradeService.deRegisterStudents(selectedClassificationGrade, selectedRegisteredStudents);
                setRegisteredStudents((prevRegStudents) =>
                    prevRegStudents.filter(
                        (student) => !selectedRegisteredStudents.some((selected) => selected._id === student._id)
                    )
                );
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: `${selectedRegisteredStudents.length} students unenrolled`,
                    life: 3000
                });
                setSelectedRegisteredStudents([]);
                setShowDeregisterDialog(false);
            }
        } catch (error) {
            setShowDeregisterDialog(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to deregister Students',
                detail: '' + error,
                life: 3000
            });
        }
    }


    const assignSectionStudents = async () => {
        setSubmitted(true);
        if (!gradeSection || selectedRegisteredStudents.length == 0) {
            return
        }
        try {
            setLoading(true);
            const data = await StudentGradeService.assignSectionStudents(gradeSection, selectedRegisteredStudents);
            if (data.acknowledged) {
                let _data = registeredStudents.filter(student =>
                    !selectedRegisteredStudents.some(
                        selected => selected._id && selected._id.toString() === student._id && student._id.toString()
                    )
                );
                setRegisteredStudents(_data);
                setSelectedRegisteredStudents([]);
            }
            /*setRegisteredStudents((prev) =>
                prev.map((student) => {
                    const selectedStudent = selectedRegisteredStudents.find(
                        (selStudent) => selStudent._id === student._id
                    );
                    if (selectedStudent) {
                        return { ...student, grade_section: gradeSection };
                    }
                    return student;
                })
            );*/
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Section Assigned!',
                life: 1500
            });
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to assign section',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
        setShowSectionDialog(false);
    }


    const detachSectionStudents = async () => {
        setSubmitted(true);
        if (!selectedGradeSection?._id || selectedRegisteredStudents.length == 0) {
            return
        }
        try {
            setLoading(true);
            StudentGradeService.detachSectionStudents(selectedGradeSection, selectedRegisteredStudents).then((data) => {
                if (data.acknowledged) {
                    let _data = registeredStudents.filter(student =>
                        !selectedRegisteredStudents.some(
                            selected => selected._id && selected._id.toString() === student._id && student._id.toString()
                        )
                    );
                    setRegisteredStudents(_data);
                    setSelectedRegisteredStudents([]);
                }
            });
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

    const openSectionDialog = () => {
        setSubmitted(false);
        setShowSectionDialog(true);
    };

    const hideSectionDialog = () => {
        //setSubmitted(false);
        setShowSectionDialog(false);
    };

    const sectionDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideSectionDialog} />
            <Button label="Assign" icon="pi pi-check" text onClick={assignSectionStudents} />
        </>
    );

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

    const openDeregisterDialog = () => {
        setShowDeregisterDialog(true);
    };

    const hideDeregisterDialog = () => {
        setShowDeregisterDialog(false);
    };

    const deregisterDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeregisterDialog} />
            <Button label="Deregister" icon="pi pi-check" text onClick={deregisterStudents} />
        </>
    );

    const sectionTemplate = (studentGrde: StudentGrade) => {
        if (!studentGrde) {
            return <>N/A</>
        }
        const section = studentGrde?.grade_section;
        if (typeof section === "object" && section !== null) {
            return <>Section {section.section_number}</>
        }
        return (
            <>N/A</>
        );
    };

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
                        className="mr-2"
                    />
                </div>
            </div>

        );
    };

    const endToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    {selectedGradeSection?._id ?
                        <>
                            <Button label="Detach Section" icon="pi pi-fw pi-times-circle" severity="danger" className="mr-2" disabled={selectedRegisteredStudents.length === 0} onClick={openDetachSectionDialog} />
                        </> :
                        <>
                            <Button label="Allocate Section" icon={PrimeIcons.TAG} severity="info" className="mr-2" disabled={selectedRegisteredStudents.length === 0} onClick={openSectionDialog} loading={loading} />
                            <Button label="Deregister" icon={PrimeIcons.TRASH} severity="danger" className="mr-2" disabled={selectedRegisteredStudents.length === 0} onClick={openDeregisterDialog} />
                        </>
                    }
                </div>
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Registred Students</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
            </span>
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate} end={endToolbarTemplate} />
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
                        globalFilter={globalFilter}
                        globalFilterFields={['student.first_name', 'student.birth_date']}
                        filters={filters}
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
                        <Column header="Student" body={studentGradeTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="student.sex" header="Gender" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="grade_section.section" header="Section" body={sectionTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="student.birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="status" header="Status" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>
                    <Dialog
                        visible={showSectionDialog}
                        style={{ width: '450px' }}
                        header={'Section Allocation'}
                        modal
                        className="p-fluid"
                        footer={sectionDialogFooter}
                        onHide={hideSectionDialog}  >
                        {selectedRegisteredStudents.length > 0 ?
                            <>
                                <div className="flex align-items-center justify-content-center">
                                    <span>
                                        Select a section to assign <b>{selectedRegisteredStudents.length}</b> students.
                                    </span>
                                </div>
                                <div className="field">
                                    <label htmlFor="section">Section</label>
                                    <div id="section">
                                        <Dropdown
                                            value={gradeSection}
                                            options={gradeSections}
                                            onChange={(e) => setGradeSection(e.value)}
                                            placeholder="Select a Section"
                                            optionLabel="section_number"
                                            required
                                            autoFocus
                                            emptyMessage="No Section Found."
                                            className={classNames({
                                                'p-invalid': submitted && !gradeSection,
                                            })}
                                        />
                                    </div>
                                </div>
                            </> : <></>
                        }
                    </Dialog>
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
                    <Dialog
                        visible={showDeregisterDialog}
                        style={{ width: '450px' }}
                        header="Confirm-Deregister"
                        modal
                        footer={deregisterDialogFooter}
                        onHide={hideDeregisterDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedRegisteredStudents.length > 0 && (
                                <span>
                                    Are you sure you want to deregister <b>{selectedRegisteredStudents.length}</b> students?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default RegisteredStudentsComponent;
