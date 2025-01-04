'use client';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { AdmissionClassification } from '@/types/model';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';



const AdmissionClassificationPage = () => {

    let emptyAdmissionClassification: AdmissionClassification = {
        academic_session: '',
        classification: 'R',
        number_of_terms: 2,
        curriculum: ''
    };

    const [admissionClassifications, setAdmissionClassifications] = useState<AdmissionClassification[]>([]);
    const [selectedAdmissionClassification, setSelectedAdmissionClassification] = useState<AdmissionClassification>(emptyAdmissionClassification);
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
        loadAdmissionClassifications();
    }, []);

    const loadAdmissionClassifications = async () => {
        try {
            const data = await AdmissionClassificationService.getAdmissionClassifications();
            setAdmissionClassifications(data); // Update state with fetched data
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load admissionClassifications',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const saveAdmissionClassification = async () => {
        setSubmitted(true);
        let _admissionClassifications = [...(admissionClassifications as any)];
        if (editMode) {
            try {
                let id = selectedAdmissionClassification._id || '';
                const updatedAdmissionClassification = await AdmissionClassificationService.updateAdmissionClassification(id, selectedAdmissionClassification);
                const index = findIndexById(id);
                _admissionClassifications[index] = updatedAdmissionClassification;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'AdmissionClassification Updated',
                    life: 3000
                });
            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to update admissionClassification',
                    detail: '' + error,
                    life: 3000
                });
            }
        } else {
            try {
                const newAdmissionClassification = await AdmissionClassificationService.createAdmissionClassification(selectedAdmissionClassification);
                _admissionClassifications.push(newAdmissionClassification);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'AdmissionClassification Created',
                    life: 3000
                });
            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to create admissionClassifications',
                    detail: '' + error,
                    life: 3000
                });
            }
        }
        setAdmissionClassifications(_admissionClassifications as any);
        setShowSaveDialog(false);
        setEditMode(false);
        setSelectedAdmissionClassification(emptyAdmissionClassification);
    };


    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (admissionClassifications as any)?.length; i++) {
            if ((admissionClassifications as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const deleteAdmissionClassification = async () => {
        try {
            const deleted = await AdmissionClassificationService.deleteAdmissionClassification(selectedAdmissionClassification._id || "");
            if (deleted) {
                let _admissionClassifications = (admissionClassifications as any)?.filter((val: any) => val._id !== selectedAdmissionClassification._id);
                setAdmissionClassifications(_admissionClassifications);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'AdmissionClassification Deleted',
                    life: 3000
                });
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete admissionClassifications',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedAdmissionClassification(emptyAdmissionClassification);
    };
    const openSaveDialog = () => {
        setEditMode(false);
        setSelectedAdmissionClassification(emptyAdmissionClassification);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (admissionClassification: AdmissionClassification) => {
        setEditMode(true);
        setSelectedAdmissionClassification({ ...admissionClassification });
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
            <Button label="Save" icon="pi pi-check" text onClick={saveAdmissionClassification} />
        </>
    );

    const confirmDeleteItem = (admissionClassification: AdmissionClassification) => {
        setSelectedAdmissionClassification(admissionClassification);
        setShowDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteAdmissionClassification} />
        </>
    );

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New AdmissionClassification" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
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
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search AdmissionClassifications..." />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: AdmissionClassification) => {
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
                        value={admissionClassifications}
                        dataKey="_id"
                        selection={selectedAdmissionClassification}
                        onSelectionChange={(e) => setSelectedAdmissionClassification(e.value as AdmissionClassification)}
                        scrollable
                        style={{ tableLayout: 'fixed' }}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} admissionClassifications"
                        globalFilter={globalFilter}
                        emptyMessage="No admissionClassifications found."
                        header={header}
                        filters={filters}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="academic_session" header="Academic Year" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="classification" header="Classification" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="number_of_terms" header="Terms" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="curriculum" header="Curriculum" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={editMode ? 'Edit AdmissionClassification Details' : 'New AdmissionClassification Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        {selectedAdmissionClassification ? <>
                            <div className="field">
                                <label htmlFor="classification">Classification</label>
                                <Dropdown
                                    id="classification"
                                    value={selectedAdmissionClassification.classification}
                                    onChange={(e) =>
                                        setSelectedAdmissionClassification({
                                            ...selectedAdmissionClassification,
                                            classification: e.value,
                                        })
                                    }
                                    options={['R', 'N', 'D']}

                                    placeholder="Select a Classification"
                                    className={classNames({
                                        'p-invalid': submitted && !selectedAdmissionClassification.classification,
                                    })}
                                />
                                {submitted && !selectedAdmissionClassification.classification && <small className="p-invalid">Classificationis required.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="number_of_terms">Terms</label>
                                <InputNumber
                                    id="number_of_terms"
                                    value={selectedAdmissionClassification.number_of_terms}
                                    onChange={(e) => setSelectedAdmissionClassification({ ...selectedAdmissionClassification, number_of_terms: e.value || 2 })}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !selectedAdmissionClassification.number_of_terms,
                                    })}
                                />
                                {submitted && !selectedAdmissionClassification.number_of_terms && <small className="p-invalid">Terms is required.</small>}
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
                            {selectedAdmissionClassification && (
                                <span>
                                    Are you sure you want to delete <b>{selectedAdmissionClassification.classification}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default AdmissionClassificationPage;
