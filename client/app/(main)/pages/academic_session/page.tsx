'use client';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AcademicSession } from '@/types/model';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import ClassificationComponent from '../../components/admission_classification/page';



const AcademicSessionPage = () => {

    let emptyAcademicSession: AcademicSession = {
        academic_year: 1970,
        start_date: null,
        end_date: null,
        status: 'PLANNED'
    };

    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
    const [selectedAcademicSession, setSelectedAcademicSession] = useState<AcademicSession>(emptyAcademicSession);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [expandedGradeRows, setExpandedGradeRows] = useState<any[] | DataTableExpandedRows>([]);


    useEffect(() => {
        initFilters();
        loadAcademicSessions();
    }, []);

    const loadAcademicSessions = async () => {
        try {
            const data = await AcademicSessionService.getAcademicSessions();
            setAcademicSessions(data); // Update state with fetched data
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load academicSessions',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const validateAcademicSession = (session: AcademicSession) => {
        if (isNaN(session.academic_year) || !session.start_date || !session.end_date) {
            return false;
        }
        return true;
    };


    const saveAcademicSession = async () => {
        setSubmitted(true);
        if (!validateAcademicSession(selectedAcademicSession)) {
            return
        }
        let _academicSessions = [...(academicSessions as any)];
        if (editMode) {
            try {
                let id = selectedAcademicSession._id || '';
                const updatedAcademicSession = await AcademicSessionService.updateAcademicSession(id, selectedAcademicSession);
                const index = findIndexById(id);
                _academicSessions[index] = updatedAcademicSession;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'AcademicSession Updated',
                    life: 3000
                });
            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to update academicSession',
                    detail: '' + error,
                    life: 3000
                });
            }
        } else {
            try {
                const newAcademicSession = await AcademicSessionService.createAcademicSession(selectedAcademicSession);
                _academicSessions.push(newAcademicSession);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'AcademicSession Created',
                    life: 3000
                });
            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to create academicSessions',
                    detail: '' + error,
                    life: 3000
                });
            }
        }
        setAcademicSessions(_academicSessions as any);
        setShowSaveDialog(false);
        setEditMode(false);
        setSelectedAcademicSession(emptyAcademicSession);
    };


    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (academicSessions as any)?.length; i++) {
            if ((academicSessions as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const deleteAcademicSession = async () => {
        try {
            const deleted = await AcademicSessionService.deleteAcademicSession(selectedAcademicSession._id || "");
            if (deleted) {
                let _academicSessions = (academicSessions as any)?.filter((val: any) => val._id !== selectedAcademicSession._id);
                setAcademicSessions(_academicSessions);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'AcademicSession Deleted',
                    life: 3000
                });
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete academicSessions',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedAcademicSession(emptyAcademicSession);
    };
    const openSaveDialog = () => {
        setEditMode(false);
        setSelectedAcademicSession(emptyAcademicSession);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (academicSession: AcademicSession) => {
        setEditMode(true);
        setSelectedAcademicSession({ ...academicSession });
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
            <Button label="Save" icon="pi pi-check" text onClick={saveAcademicSession} />
        </>
    );

    const confirmDeleteItem = (academicSession: AcademicSession) => {
        setSelectedAcademicSession(academicSession);
        setShowDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteAcademicSession} />
        </>
    );

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New Ac. Calendar" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
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
            <h5 className="m-0">Manage Academic Sessions</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search Calendars..." />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: AcademicSession) => {
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
                        value={academicSessions}
                        dataKey="_id"
                        selection={selectedAcademicSession}
                        onSelectionChange={(e) => setSelectedAcademicSession(e.value as AcademicSession)}
                        scrollable
                        style={{ tableLayout: 'fixed' }}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} academicSessions"
                        globalFilter={globalFilter}
                        emptyMessage="No academicSessions found."
                        header={header}
                        filters={filters}
                        expandedRows={expandedGradeRows}
                        onRowToggle={(e) => setExpandedGradeRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <ClassificationComponent
                                academic_session={data as AcademicSession}
                            />
                        )}
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="academic_year" header="Academic Year" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="start_date" header="Start Date" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="end_date" header="End Date" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Status" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={editMode ? 'Edit AcademicSession Details' : 'New AcademicSession Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        {selectedAcademicSession ? <>
                            <div className="field">
                                <label htmlFor="year">Session Year</label>
                                <InputNumber
                                    id="year"
                                    value={selectedAcademicSession.academic_year}
                                    onChange={(e) => setSelectedAcademicSession({ ...selectedAcademicSession, academic_year: e.value || 1990 })}
                                    mode="decimal" // Basic number mode
                                    useGrouping={false} // No thousand separator
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !selectedAcademicSession.academic_year,
                                    })}
                                />
                                {submitted && !selectedAcademicSession.academic_year && <small className="p-invalid">Academic Session Year is required.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="start_date">Start Date</label>
                                <Calendar id="start_date"
                                    value={selectedAcademicSession.start_date ? new Date(selectedAcademicSession.start_date) : null}
                                    onChange={(e) => setSelectedAcademicSession({ ...selectedAcademicSession, start_date: e.value || null })}
                                    showIcon required className={classNames({
                                        'p-invalid': submitted && !selectedAcademicSession.start_date,
                                    })} />
                                {submitted && !selectedAcademicSession.start_date && <small className="p-invalid">Session Date is required.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="end_date">End Date</label>
                                <Calendar id="end_date" value={selectedAcademicSession.end_date ? new Date(selectedAcademicSession.end_date) : null}
                                    onChange={(e) => setSelectedAcademicSession({ ...selectedAcademicSession, end_date: e.value || null })}
                                    showIcon required className={classNames({
                                        'p-invalid': submitted && !selectedAcademicSession.end_date,
                                    })} />
                                {submitted && !selectedAcademicSession.end_date && <small className="p-invalid">Session End Date is required.</small>}
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
                            {selectedAcademicSession && (
                                <span>
                                    Are you sure you want to delete <b>{selectedAcademicSession.academic_year}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default AcademicSessionPage;
