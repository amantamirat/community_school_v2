'use client';
import { DepartmentService } from '@/services/DepartmentService';
import { TeacherService } from '@/services/TeacherService';
import { Department, Teacher } from '@/types/model';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';

const TeacherPage = () => {
    let emptyTeacher: Teacher = {
        first_name: '',
        middle_name: '',
        last_name: '',
        sex: 'Male',
        department: '', // Reference to department
    };
    const [departments, setDepartments] = useState<Department[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher>(emptyTeacher);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});

    useEffect(() => {
        initFilters();
        loadDepartments();
        loadTeachers();
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

    const loadDepartments = async () => {
        try {
            DepartmentService.getDepartments().then((data) => {
                setDepartments(data);
            });
        } catch (err) {
            console.error('Failed to load departments:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load departments',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const loadTeachers = async () => {
        try {
            TeacherService.getPopulatedTeachers().then((data) => {
                setTeachers(data);
            });
        } catch (err) {
            //console.error('Failed to load teachers:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load teachers',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const validateTeacher = (teacher: Teacher) => {
        if (teacher.first_name.trim() === '' || teacher.last_name.trim() === '' || teacher.middle_name.trim() === '' || !teacher.department) {
            return false;
        }
        return true;
    };

    const saveTeacher = async () => {
        setSubmitted(true);
        let _teachers = [...(teachers as any)];
        if (!validateTeacher(selectedTeacher)) {
            return;
        }
        try {
            if (selectedTeacher._id) {
                TeacherService.updateTeacher(selectedTeacher).then((updatedTeacher) => {
                    if (updatedTeacher._id) {
                        const teacher = { ...selectedTeacher }
                        const index = findIndexById(updatedTeacher._id);
                        _teachers[index] = teacher;
                        setTeachers(_teachers);
                    }
                });
            } else {
                TeacherService.createTeacher(selectedTeacher).then((newTeacher) => {
                    const teacher = { ...selectedTeacher, _id: newTeacher._id }
                    _teachers.push(teacher);
                    setTeachers(_teachers);
                });
            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `Teacher ${selectedTeacher._id ? "updated" : 'created'}`,
                life: 3000
            });
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to update teacher',
                detail: '' + error,
                life: 3000
            });
        }
        setShowSaveDialog(false);
        setSelectedTeacher(emptyTeacher);
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (teachers as any)?.length; i++) {
            if ((teachers as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const deleteTeacher = async () => {
        try {
            if (selectedTeacher._id) {
                const deleted = await TeacherService.deleteTeacher(selectedTeacher);
                if (deleted) {
                    let _teachers = (teachers as any)?.filter((val: any) => val._id !== selectedTeacher._id);
                    setTeachers(_teachers);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Teacher Deleted',
                        life: 3000
                    });
                }
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete teacher',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedTeacher(emptyTeacher);
    };

    const openSaveDialog = () => {
        setSelectedTeacher(emptyTeacher);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (teacher: Teacher) => {
        /*
        setSelectedTeacher({
            ...teacher,
            department: (teacher.department && typeof teacher.department === 'string')
                ? findDepartmentById(teacher.department) || teacher.department
                : teacher.department
        });*/
        setSelectedTeacher(teacher);
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
            <Button label="Save" icon="pi pi-check" text onClick={saveTeacher} />
        </>
    );

    const confirmDeleteItem = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setShowDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteTeacher} />
        </>
    );

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New Teacher" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Teachers</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." className="w-full md:w-1/3" />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: Teacher) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteItem(rowData)} />
            </>
        );
    };


    {/*
        const findDepartmentById = (id: string): Department | undefined => {
        return departments.find(department => department._id === id);
    };
    const departmentBodyTemplate = (rowData: Teacher) => {
        const department = typeof rowData.department === "string" ? findDepartmentById(rowData.department) : rowData.department;
        return department ? departmentTemplate(department as Department) : <></>;
    };
        <Column header="Department" body={departmentBodyTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        */}

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={teachers}
                        selection={selectedTeacher}
                        onSelectionChange={(e) => setSelectedTeacher(e.value as Teacher)}
                        dataKey="_id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} teachers"
                        globalFilter={globalFilter}
                        emptyMessage="No teachers found."
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
                        <Column field="department.name" header="Department" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={selectedTeacher?._id ? 'Edit Teacher Details' : 'New Teacher Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        {selectedTeacher ? (<>
                            <div className="field">
                                <label htmlFor="first_name">First Name</label>
                                <InputText
                                    id="first_name"
                                    value={selectedTeacher.first_name}
                                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, first_name: e.target.value })}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !selectedTeacher.first_name,
                                    })}
                                />
                                {submitted && !selectedTeacher.first_name && <small className="p-invalid">First Name is required.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="middle_name">Middle Name</label>
                                <InputText
                                    id="middle_name"
                                    value={selectedTeacher.middle_name}
                                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, middle_name: e.target.value })}
                                    required
                                    className={classNames({
                                        'p-invalid': submitted && !selectedTeacher.middle_name,
                                    })}
                                />
                                {submitted && !selectedTeacher.middle_name && <small className="p-invalid">Middle Name is required.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="last_name">Last Name</label>
                                <InputText
                                    id="last_name"
                                    value={selectedTeacher.last_name}
                                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, last_name: e.target.value })}
                                    required
                                    className={classNames({
                                        'p-invalid': submitted && !selectedTeacher.last_name,
                                    })}
                                />
                                {submitted && !selectedTeacher.last_name && <small className="p-invalid">Last Name is required.</small>}
                            </div>

                            <div className="field">
                                <label className="mb-3">Sex</label>
                                <div className="formgrid grid">
                                    <div className="field-radiobutton col-4">
                                        <RadioButton inputId="sex1" name="sex" value="Male" onChange={(e) => setSelectedTeacher({ ...selectedTeacher, sex: "Male" })} checked={selectedTeacher.sex === 'Male'} />
                                        <label htmlFor="sex1">Male</label>
                                    </div>
                                    <div className="field-radiobutton col-4">
                                        <RadioButton inputId="sex2" name="sex" value="Female" onChange={(e) => setSelectedTeacher({ ...selectedTeacher, sex: "Female" })} checked={selectedTeacher.sex === 'Female'} />
                                        <label htmlFor="sex2">Female</label>
                                    </div>
                                </div>
                            </div>

                            <div className="field">
                                <label htmlFor="department">Department</label>
                                <Dropdown
                                    id="department"
                                    value={selectedTeacher.department}
                                    onChange={(e) =>
                                        setSelectedTeacher({
                                            ...selectedTeacher,
                                            department: e.value,
                                        })
                                    }
                                    options={departments}
                                    optionLabel="name"
                                    placeholder="Select Department"
                                    className={classNames({
                                        'p-invalid': submitted && !selectedTeacher.department,
                                    })}
                                />

                                {submitted && !selectedTeacher.department && <small className="p-invalid">Department is required.</small>}
                            </div>
                        </>) : <></>}
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
                            {selectedTeacher && (
                                <span>
                                    Are you sure you want to delete <b>{selectedTeacher.first_name} {selectedTeacher.last_name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default TeacherPage;
