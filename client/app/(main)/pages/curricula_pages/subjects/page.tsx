'use client';
import { SubjectService } from '@/services/SubjectService';
import { Subject } from '@/types/model';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';



const SubjectPage = () => {

    let emptySubject: Subject = {
        title: '',
        load: 3
    };

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject>(emptySubject);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});

    useEffect(() => {
        initFilters();
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await SubjectService.getSubjects();
            setSubjects(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load subjects:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load subjects',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const validateSubject = (subject: Subject) => {
        if (isNaN(subject.load) || subject.title.trim() === "") {
            return false;
        }
        return true;
    };

    const saveSubject = async () => {
        setSubmitted(true);
        if (!validateSubject(selectedSubject)) {
            return;
        }
        let _subjects = [...(subjects as any)];
        try {
            if (selectedSubject._id) {
                const updatedSubject = await SubjectService.updateSubject(selectedSubject);
                const index = findIndexById(selectedSubject._id);
                _subjects[index] = updatedSubject;
            } else {
                const newSubject = await SubjectService.createSubject(selectedSubject);
                _subjects.push(newSubject);
            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `Subject ${selectedSubject._id ? "updated" : 'created'}`,
                life: 3000
            });
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: `Failed to ${selectedSubject._id ? "update" : 'create'} subject`,
                detail: '' + error,
                life: 3000
            });
        }
        setSubjects(_subjects);
        setShowSaveDialog(false);
        setSelectedSubject(emptySubject);
    };


    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (subjects as any)?.length; i++) {
            if ((subjects as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const deleteSubject = async () => {
        try {
            if (selectedSubject._id) {
                const deleted = await SubjectService.deleteSubject(selectedSubject);
                if (deleted) {
                    let _subjects = (subjects as any)?.filter((val: any) => val._id !== selectedSubject._id);
                    setSubjects(_subjects);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Subject Deleted',
                        life: 3000
                    });
                }
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete subjects',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedSubject(emptySubject);
    };
    const openSaveDialog = () => {
        setSelectedSubject(emptySubject);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (subject: Subject) => {
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
            <Button label="Save" icon="pi pi-check" text onClick={saveSubject} />
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
            <Button label="Delete" icon="pi pi-check" text onClick={deleteSubject} />
        </>
    );

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New Subject" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
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
            <h5 className="m-0">Manage Subjects</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search Subjects..." />
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
                        dataKey="_id"
                        selection={selectedSubject}
                        onSelectionChange={(e) => setSelectedSubject(e.value as Subject)}
                        scrollable
                        style={{ tableLayout: 'fixed' }}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} subjects"
                        globalFilter={globalFilter}
                        emptyMessage="No subjects found."
                        header={header}
                        filters={filters}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="title" header="Subject Title" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="load" header="Load (hrs/week)" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={selectedSubject?._id ? 'Edit Subject Details' : 'New Subject Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        {selectedSubject ? <><div className="field">
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
                                    min={1}
                                    max={8}
                                    required
                                    className={classNames({
                                        'p-invalid': submitted && !selectedSubject.load,
                                    })}
                                />
                                {submitted && !selectedSubject.load && <small className="p-invalid">Subject Load is required.</small>}
                            </div>
                        </> : <></>}
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
