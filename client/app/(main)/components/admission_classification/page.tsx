'use client';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { CurriculumService } from '@/services/CurriculumService';
import { AcademicSession, AdmissionClassification, Curriculum } from '@/types/model';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
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

interface AdmissionClassificationProps {
    academic_session: AcademicSession;
}


const ClassificationComponent = (props: AdmissionClassificationProps) => {

    let emptyAdmissionClassification: AdmissionClassification = {
        academic_session: '',
        classification: "REGULAR",
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
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);

    useEffect(() => {
        loadCurriculums();
        loadAdmissionClassifications();
    }, []);

    const loadCurriculums = async () => {
        try {
            const data = await CurriculumService.getCurriculums();
            setCurriculums(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load curricula:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load curricula',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const loadAdmissionClassifications = async () => {
        try {
            const data = await AdmissionClassificationService.getAcademicSessionClassifications(props.academic_session._id || '');
            setAdmissionClassifications(data); // Update state with fetched data
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load admission Classifications',
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
        setSelectedAdmissionClassification({ ...emptyAdmissionClassification, academic_session: props.academic_session._id || '' });
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
                    <Button label="Add Classification" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
    };



    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Admission Classfications</h5>
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
                        emptyMessage="No Classifications found."
                        header={header}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="classification" header="Classification" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="number_of_terms" header="Terms" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="curriculum" header="Curriculum" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={editMode ? 'Edit Classification Details' : 'New Classification Details'}
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
                                    options={["REGULAR", "EVENING", "DISTANCE"]}

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
                            <div className="field">
                                <label htmlFor="curriculum">Curriculum</label>
                                <Dropdown
                                    id="curriculum"
                                    value={curriculums.find(curriculum => curriculum._id === selectedAdmissionClassification.curriculum) || null}
                                    onChange={(e) =>
                                        setSelectedAdmissionClassification({
                                            ...selectedAdmissionClassification,
                                            curriculum: e.value ? e.value._id : "",
                                        })
                                    }
                                    options={curriculums}
                                    optionLabel="_id"
                                    placeholder="Select Curriculum"
                                    className={classNames({
                                        'p-invalid': submitted && !selectedAdmissionClassification.curriculum,
                                    })}
                                />
                                {submitted && !selectedAdmissionClassification.curriculum && <small className="p-invalid">Last Name is required.</small>}
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

export default ClassificationComponent;
