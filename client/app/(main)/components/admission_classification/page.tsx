'use client';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { CurriculumService } from '@/services/CurriculumService';
import { AcademicSession, AdmissionClassification, Curriculum } from '@/types/model';
import { curriculumTemplate } from '@/types/templates';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import ClassificationGradeComponent from '../classification_grade/page';

interface AdmissionClassificationProps {
    academic_session: AcademicSession;
}


const ClassificationComponent = (props: AdmissionClassificationProps) => {

    let emptyAdmissionClassification: AdmissionClassification = {
        academic_session: props.academic_session,
        classification: "REGULAR",
        curriculum: ''
    };

    const [admissionClassifications, setAdmissionClassifications] = useState<AdmissionClassification[]>([]);
    const [selectedAdmissionClassification, setSelectedAdmissionClassification] = useState<AdmissionClassification>(emptyAdmissionClassification);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [expandedGradeRows, setExpandedGradeRows] = useState<any[] | DataTableExpandedRows>([]);

    useEffect(() => {
        loadCurriculums();
        loadAdmissionClassifications();
    }, []);

    const loadCurriculums = async () => {
        try {
            const data = await CurriculumService.getCurriculums();
            setCurriculums(data);
        } catch (err) {
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
            const data = await AdmissionClassificationService.getAcademicSessionClassifications(props.academic_session);
            setAdmissionClassifications(data);
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load admission Classifications',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const checkClassification = (classification: AdmissionClassification) => {
        if ((classification.curriculum as Curriculum).classification !== classification.classification) {
            toast.current?.show({
                severity: 'error',
                summary: `Failed to create Admission Classification`,
                detail: 'Classification Mismatch',
                life: 3000
            });
            return false;
        }
        return true;
    }

    const validateAdmissionClassification = (classification: AdmissionClassification) => {
        if (!checkClassification(classification) || !classification.academic_session || !classification.curriculum) {
            return false;
        }
        return true;
    };

    const saveAdmissionClassification = async () => {
        setSubmitted(true);
        if (!validateAdmissionClassification(selectedAdmissionClassification)) {
            return
        }
        let _admissionClassifications = [...(admissionClassifications as any)];
        try {
            const newAdmissionClassification = await AdmissionClassificationService.createAdmissionClassification(selectedAdmissionClassification);
            _admissionClassifications.push(newAdmissionClassification);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Admission Classification Created',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: `Failed to create Admission Classification`,
                detail: '' + error,
                life: 3000
            });
        }
        setAdmissionClassifications(_admissionClassifications as any);
        setShowSaveDialog(false);
        setSelectedAdmissionClassification(emptyAdmissionClassification);
    };




    const deleteAdmissionClassification = async () => {
        try {
            const deleted = await AdmissionClassificationService.deleteAdmissionClassification(selectedAdmissionClassification);
            if (deleted) {
                let _admissionClassifications = (admissionClassifications as any)?.filter((val: any) => val._id !== selectedAdmissionClassification._id);
                setAdmissionClassifications(_admissionClassifications);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Admission Classification Deleted',
                    life: 3000
                });
            }
        } catch (error) {
            //console.error(error);
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
        setSelectedAdmissionClassification(emptyAdmissionClassification);
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



    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Admission Classfications</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <div className="my-2">
                    <Button tooltip="Add Classification" icon="pi pi-plus" className="mr-2" onClick={openSaveDialog} />
                </div>
            </span>
        </div>
    );

    const findCurriculumById = (id: string): Curriculum | undefined => {
        return curriculums.find(curriculum => curriculum._id === id);
    };
    const curriculumBodyTemplate = (rowData: AdmissionClassification) => {
        const curriculum = typeof rowData.curriculum === "string" ? findCurriculumById(rowData.curriculum) : rowData.curriculum;
        return curriculum ? curriculumTemplate(curriculum as Curriculum) : <></>;
    };

    const actionBodyTemplate = (rowData: AdmissionClassification) => {
        return (
            <>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteItem(rowData)} />
            </>
        );
    };

    const handleUpdate = (updated: AdmissionClassification) => {
        let _admissionClassifications = [...admissionClassifications]
        const index = admissionClassifications.findIndex((adm) => adm._id === updated._id);
        _admissionClassifications[index] = { ...updated };
        setAdmissionClassifications(_admissionClassifications);
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <DataTable
                        ref={dt}
                        value={admissionClassifications}
                        dataKey="_id"
                        selection={selectedAdmissionClassification}
                        onSelectionChange={(e) => setSelectedAdmissionClassification(e.value as AdmissionClassification)}
                        scrollable
                        style={{ tableLayout: 'fixed' }}
                        rows={3}
                        className="datatable-responsive"
                        emptyMessage="No Classifications found."
                        header={header}
                        expandedRows={expandedGradeRows}
                        onRowToggle={(e) => setExpandedGradeRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <ClassificationGradeComponent
                                addmissionClassification={data as AdmissionClassification}
                                onUpdate={handleUpdate}
                            />
                        )}
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="classification" header="Classification" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="curriculum" header="Curriculum" body={curriculumBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={'New Classification Details'}
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
                                <label htmlFor="curriculum">Curriculum</label>
                                <Dropdown
                                    id="curriculum"
                                    value={selectedAdmissionClassification.curriculum || null}
                                    onChange={(e) =>
                                        setSelectedAdmissionClassification({
                                            ...selectedAdmissionClassification,
                                            curriculum: e.value,
                                        })
                                    }
                                    options={curriculums}
                                    itemTemplate={curriculumTemplate}
                                    valueTemplate={selectedAdmissionClassification.curriculum ? curriculumTemplate : ""}
                                    optionLabel="_id"
                                    placeholder="Select Curriculum"
                                    className={classNames({
                                        'p-invalid': submitted && !selectedAdmissionClassification.curriculum,
                                    })}
                                />
                                {submitted && !selectedAdmissionClassification.curriculum && <small className="p-invalid">Curriculum is required.</small>}
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
