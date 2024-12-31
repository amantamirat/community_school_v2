'use client';
import { Teacher } from '@/types/model';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useRef, useState } from 'react';



const TeachersPage = () => {
    let emptyTeacher: Teacher = {
        _id: '',
        first_name: '',
        last_name: '',
        sex: 'Male'
    };
    const [teachers, setTeachers] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher>(emptyTeacher);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');


    const openSaveDialog = () => {
        setEditMode(false);
        setSelectedTeacher(emptyTeacher);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (teacher: Teacher) => {
        setEditMode(true);
        setSelectedTeacher({ ...teacher });
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
            <Button label="Save" icon="pi pi-check" text />
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
            <Button label="Delete" icon="pi pi-check" text />
        </>
    );

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Teachers</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
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

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate} ></Toolbar>
                    <DataTable
                        ref={dt}
                        value={teachers}
                        selection={setSelectedTeacher}
                        onSelectionChange={(e) => setSelectedTeacher(e.value as Teacher)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter}
                        emptyMessage="No teachers found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="first_name" header="First Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="last_name" header="Last Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={showSaveDialog} style={{ width: '450px' }} header={editMode ? "Edit Teacher Details" : "New Teacher Details"} modal className="p-fluid" footer={saveDialogFooter} onHide={hideSaveDialog}>
                        <div className="field">
                            <label htmlFor="name">First Name</label>
                            <InputText
                                id="first_name"
                                value={selectedTeacher.first_name}
                                onChange={(e) => setSelectedTeacher({ ...selectedTeacher, first_name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !selectedTeacher.first_name
                                })}
                            />
                            {submitted && !selectedTeacher.first_name && <small className="p-invalid">First Name is required.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={showDeleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteDialogFooter} onHide={hideDeleteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedTeacher && (
                                <span>
                                    Are you sure you want to delete <b>{selectedTeacher.first_name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                </div>
            </div>
        </div>
    );
};

export default TeachersPage;
