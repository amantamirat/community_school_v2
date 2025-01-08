'use client';
import { DepartmentService } from '@/services/DepartmentService';
import { StudentService } from '@/services/StudentService';
import { Student } from '@/types/model';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';

const StudentPage = () => {
    let emptyStudent: Student = {
        first_name: '',
        middle_name: '',
        last_name: '',
        sex: 'Male',
        birth_date: null,
    };
    const [students, setStudents] = useState<Student[] | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student>(emptyStudent);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});

    useEffect(() => {
        initFilters();
        loadStudents();
    }, []);



    const loadStudents = async () => {
        try {
            const data = await StudentService.getStudents();
            setStudents(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load students:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load students',
                detail: '' + err,
                life: 3000
            });
        }
    };

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

    const validateStudent = (student: Student) => {
        if (student.first_name.trim() === '' ||
            student.middle_name.trim() === '' ||
            student.last_name.trim() === '' ||
            !student.birth_date
        ) {
            return false;
        }
        return true; // All required fields are provided
    };

    const saveStudent = async () => {
        setSubmitted(true);
        let _students = [...(students as any)];
        if (!validateStudent(selectedStudent)) {
            return;
        }
        try {
            if (editMode) {
                let id = selectedStudent._id || '';
                const updatedStudent = await StudentService.updateStudent(id, selectedStudent);
                const index = findIndexById(id);
                _students[index] = updatedStudent;
            } else {
                const newStudent = await StudentService.createStudent(selectedStudent);
                _students.push(newStudent);
            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `Student ${editMode ? 'Updated' : 'Created'}`,
                life: 3000
            });

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: `Failed to ${editMode ? 'update' : 'create'} Student`,
                detail: '' + error,
                life: 3000
            });
        }
        setStudents(_students);
        setShowSaveDialog(false);
        setEditMode(false);
        setSelectedStudent(emptyStudent);
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (students as any)?.length; i++) {
            if ((students as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const deleteStudent = async () => {
        try {
            const deleted = await StudentService.deleteStudent(selectedStudent._id || "");
            if (deleted) {
                let _students = (students as any)?.filter((val: any) => val._id !== selectedStudent._id);
                setStudents(_students);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Student Deleted',
                    life: 3000
                });
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete student',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedStudent(emptyStudent);
    };

    const openSaveDialog = () => {
        setEditMode(false);
        setSelectedStudent(emptyStudent);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (student: Student) => {
        setEditMode(true);
        setSelectedStudent({ ...student });
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const hideSaveDialog = () => {
        setSubmitted(false);
        setShowSaveDialog(false);
    };

    const saveDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideSaveDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveStudent} />
        </>
    );

    const confirmDeleteItem = (student: Student) => {
        setSelectedStudent(student);
        setShowDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteStudent} />
        </>
    );

    const endToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
            </React.Fragment>
        );
    };

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New Student" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Students</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: Student) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteItem(rowData)} />
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
                        ref={dt}
                        value={students}
                        selection={selectedStudent}
                        onSelectionChange={(e) => setSelectedStudent(e.value as Student)}
                        dataKey="_id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                        globalFilter={globalFilter}
                        emptyMessage="No students found."
                        header={header}
                        scrollable
                        filters={filters}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column
                            header="#"
                            body={(rowData, options) => options.rowIndex + 1}
                            style={{ width: '50px' }}
                        />
                        <Column field="first_name" header="First Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="last_name" header="Last Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="sex" header="Sex" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={editMode ? 'Edit Student Details' : 'New Student Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        <div className="field">
                            <label htmlFor="first_name">First Name</label>
                            <InputText
                                id="first_name"
                                value={selectedStudent.first_name}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, first_name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !selectedStudent.first_name,
                                })}
                            />
                            {submitted && !selectedStudent.first_name && <small className="p-invalid">First Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="middle_name">Middle Name</label>
                            <InputText
                                id="middle_name"
                                value={selectedStudent.middle_name}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, middle_name: e.target.value })}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !selectedStudent.middle_name,
                                })}
                            />
                            {submitted && !selectedStudent.middle_name && <small className="p-invalid">Middle Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="last_name">Last Name</label>
                            <InputText
                                id="last_name"
                                value={selectedStudent.last_name}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, last_name: e.target.value })}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !selectedStudent.last_name,
                                })}
                            />
                            {submitted && !selectedStudent.last_name && <small className="p-invalid">Last Name is required.</small>}
                        </div>

                        <div className="field">
                            <label className="mb-3">Sex</label>
                            <div className="formgrid grid">
                                <div className="field-radiobutton col-4">
                                    <RadioButton inputId="sex1" name="sex" value="Male" onChange={(e) => setSelectedStudent({ ...selectedStudent, sex: "Male" })} checked={selectedStudent.sex === 'Male'} />
                                    <label htmlFor="sex1">Male</label>
                                </div>
                                <div className="field-radiobutton col-4">
                                    <RadioButton inputId="sex2" name="sex" value="Female" onChange={(e) => setSelectedStudent({ ...selectedStudent, sex: "Female" })} checked={selectedStudent.sex === 'Female'} />
                                    <label htmlFor="sex2">Female</label>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="birth_date">Birth Date</label>
                            <Calendar id="birth_date"
                                value={selectedStudent.birth_date ? new Date(selectedStudent.birth_date) : null}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, birth_date: e.value || null })}
                                showIcon required className={classNames({
                                    'p-invalid': submitted && !selectedStudent.birth_date,
                                })} />

                            {submitted && !selectedStudent.birth_date && <small className="p-invalid">Birth Date is required.</small>}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={showDeleteDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteDialogFooter}
                        onHide={hideDeleteDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedStudent && (
                                <span>
                                    Are you sure you want to delete <b>{selectedStudent.first_name} {selectedStudent.last_name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;
