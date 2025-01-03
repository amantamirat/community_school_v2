'use client';
import { DepartmentService } from '@/services/DepartmentService';
import { Department} from '@/types/model';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';



const DepartmentPage = () => {
    let emptyDepartment: Department = {
        name: ''
    };
    const [departments, setDepartments] = useState<Department[] | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department>(emptyDepartment);
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
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await DepartmentService.getDepartments();
            setDepartments(data); // Update state with fetched data
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



    const saveDepartment = async () => {
        setSubmitted(true);
        let _departments = [...(departments as any)];
        if (editMode) {
            try {
                let id = selectedDepartment._id || '';
                const updatedDepartment = await DepartmentService.updateDepartment(id, selectedDepartment);
                const index = findIndexById(id);
                _departments[index] = updatedDepartment;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Department Updated',
                    life: 3000
                });
            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to update department',
                    detail: '' + error,
                    life: 3000
                });
            }
        } else {
            try {
                const newDepartment = await DepartmentService.createDepartment(selectedDepartment);
                //console.log("Created Department:", newDepartment);
                _departments.push(newDepartment);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Department Created',
                    life: 3000
                });
            } catch (error) {
                //console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to create departments',
                    detail: '' + error,
                    life: 3000
                });
            }
        }
        setDepartments(_departments as any);
        setShowSaveDialog(false);
        setEditMode(false);
        setSelectedDepartment(emptyDepartment);
    };


    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (departments as any)?.length; i++) {
            if ((departments as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const deleteDepartment = async () => {
        try {
            const deleted = await DepartmentService.deleteDepartment(selectedDepartment._id || "");
            if (deleted) {
                let _departments = (departments as any)?.filter((val: any) => val._id !== selectedDepartment._id);
                setDepartments(_departments);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Department Deleted',
                    life: 3000
                });
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete departments',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedDepartment(emptyDepartment);
    };




    const openSaveDialog = () => {
        setEditMode(false);
        setSelectedDepartment(emptyDepartment);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (department: Department) => {
        setEditMode(true);
        setSelectedDepartment({ ...department });
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
            <Button label="Save" icon="pi pi-check" text onClick={saveDepartment} />
        </>
    );

    const confirmDeleteItem = (department: Department) => {
        setSelectedDepartment(department);
        setShowDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteDepartment} />
        </>
    );


    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New Department" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
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

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Departments</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search Dep't..." />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: Department) => {
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
                    <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={departments}
                        selection={selectedDepartment}
                        onSelectionChange={(e) => setSelectedDepartment(e.value as Department)}
                        dataKey="_id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} departments"
                        globalFilter={globalFilter}
                        emptyMessage="No departments found."
                        header={header}
                        scrollable
                        filters={filters}
                        onRowDoubleClick={(e) => {
                            const selected = e.data;  // The selected row data
                            if (selected) {
                                setSelectedDepartment(selected as Department);
                                // Perform any further logic like opening a modal or navigating
                            }
                        }}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column
                            header="#"
                            body={(rowData, options) => options.rowIndex + 1}
                            style={{ width: '50px' }}
                        />
                        <Column field="name" header="Department Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={editMode ? 'Edit Department Details' : 'New Department Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        {selectedDepartment ? (<>
                            <div className="field">
                                <label htmlFor="name">Department Name</label>
                                <InputText
                                    id="name"
                                    value={selectedDepartment.name}
                                    onChange={(e) => setSelectedDepartment({ ...selectedDepartment, name: e.target.value })}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !selectedDepartment.name,
                                    })}
                                />
                                {submitted && !selectedDepartment.name && <small className="p-invalid">Department Name is required.</small>}
                            </div>
                        </>) : (<></>)}
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
                            {selectedDepartment && (
                                <span>
                                    Are you sure you want to delete <b>{selectedDepartment.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default DepartmentPage;
