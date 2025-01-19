'use client';
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { StudentGradeService } from '@/services/StudentGradeService';
import { ClassificationGrade, GradeSection, StudentGrade } from '@/types/model';
import { studentGradeTemplate } from '@/types/templates';
import { FilterMatchMode, PrimeIcons } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
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
                    setGradeSections(data);
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
            }
        } catch (error) {
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
            const updatedData = await StudentGradeService.assignSectionStudents(gradeSection, selectedRegisteredStudents);
            console.log(updatedData);
            //const index = findIndexById(id);
            //_sectionClasss[index] = updatedClass;
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
        }
        setShowSectionDialog(false);
    }

    const openSectionDialog = () => {
        //setSubmitted(false);
        setShowSectionDialog(true);
    };

    const hideSectionDialog = () => {
        //setSubmitted(false);
        setShowSectionDialog(false);
    };

    const sectionDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideSectionDialog} />
            <Button label="Assign" icon="pi pi-check" text onClick={assignSectionStudents}/>
        </>
    );

    const startToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Assign Section" icon={PrimeIcons.TAG} severity="info" className="mr-2" disabled={selectedRegisteredStudents.length == 0} onClick={openSectionDialog} />
                </div>
            </>
        );
    };

    const endToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Deregister" icon={PrimeIcons.TRASH} severity="danger" className="mr-2" disabled={selectedRegisteredStudents.length == 0} onClick={deregisterStudents} />
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
                        onSelectionChange={(e) => setSelectedRegisteredStudents(e.value as any)}>
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column
                            header="#"
                            body={(rowData, options) => options.rowIndex + 1}
                            style={{ width: '50px' }}
                        />
                        <Column header="Student" body={studentGradeTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="student.sex" header="Gender" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="grade_section.section" header="Section" sortable headerStyle={{ minWidth: '10rem' }}></Column>
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
                                            optionLabel="section"
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
                </div>
            </div>
        </div>
    );
};

export default RegisteredStudentsComponent;
