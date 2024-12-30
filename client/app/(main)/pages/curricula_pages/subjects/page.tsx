'use client';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useRef, useState } from 'react';

type Subject = {
    _id?: string;
    title: string;
    load: number;
    optional: boolean;
};

const SubjectPage = () => {
    let emptySubject: Subject = {
        _id: '',
        title: '',
        load: 0,
        optional: false,
    };

    const [subjects, setSubjects] = useState<Subject[] | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject>(emptySubject);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    const openSaveDialog = () => {
        setEditMode(false);
        setSelectedSubject(emptySubject);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (subject: Subject) => {
        setEditMode(true);
        setSelectedSubject({ ...subject });
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

    const confirmDeleteItem = (subject: Subject) => {
        setSelectedSubject(subject);
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
                    <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Subjects</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: Subject) => {
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
                        value={subjects}
                        selection={selectedSubject}
                        onSelectionChange={(e) => setSelectedSubject(e.value as Subject)}
                        dataKey="_id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} subjects"
                        globalFilter={globalFilter}
                        emptyMessage="No subjects found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="title" header="Subject Title" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="load" header="Load (hrs/week)" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="optional" header="Optional" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={editMode ? 'Edit Subject Details' : 'New Subject Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        <div className="field">
                            <label htmlFor="title">Subject Title</label>
                            <InputText
                                id="title"
                                value={selectedSubject.title}
                                onChange={(e) => setSelectedSubject({ ...selectedSubject, title: e.target.value })}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !selectedSubject.title,
                                })}
                            />
                            {submitted && !selectedSubject.title && <small className="p-invalid">Subject Title is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="load">Load (hours/week)</label>
                            <InputNumber
                                id="load"
                                value={selectedSubject.load}
                                onChange={(e) => setSelectedSubject({ ...selectedSubject, load: e.value || 0 })}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !selectedSubject.load,
                                })}
                            />
                            {submitted && !selectedSubject.load && <small className="p-invalid">Subject Load is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="optional">Is Optional</label>
                            <Checkbox
                                id="optional"
                                checked={selectedSubject.optional}
                                onChange={(e) => setSelectedSubject({ ...selectedSubject, optional: e.checked || false })}
                            />
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
                            {selectedSubject && (
                                <span>
                                    Are you sure you want to delete <b>{selectedSubject.title}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default SubjectPage;
