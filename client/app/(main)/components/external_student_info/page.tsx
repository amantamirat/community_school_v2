import { ExternalStudentInfoService } from "@/services/ExternalStudentInfoService";
import { GradeService } from "@/services/GradeService";
import { ExternalStudentInfo, Grade, Student } from "@/types/model";
import { gradeTemplate } from "@/types/templates";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";

interface ExternalInfoProps {
    student: Student;
}

const ExternalInfoComponent = (props: ExternalInfoProps) => {

    let emptyExternalInfo: ExternalStudentInfo = {
        student: props.student,
        school_name: '',
        academic_year: 2000,
        classification: "REGULAR",
        grade: '',
        average_result: 0,
        status: 'INCOMPLETE',
        transfer_reason: ''
    };

    const [externalInfos, setExternalInfos] = useState<ExternalStudentInfo[]>([]);
    const [selectedExternalInfo, setSelectedExternalInfo] = useState<ExternalStudentInfo>(emptyExternalInfo);
    const [submitted, setSubmitted] = useState(false);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const toast = useRef<Toast>(null);
    //const [loading, setLoading] = useState(false);       


    useEffect(() => {
        loadGrades();
        ExternalStudentInfoService.getExternalInfoByStudent(props.student).then((data) => {
            setExternalInfos(data);
        }).catch((err) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load student info',
                detail: '' + err,
                life: 3000
            });
        });
    }, []);

    const loadGrades = async () => {
            try {
                const data = await GradeService.getGrades();
                setGrades(data);
            } catch (err) {
                //console.error('Failed to load grades:', err);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load grades',
                    detail: '' + err,
                    life: 3000
                });
            }
        };
    


    const validateExternalInfo = (externalInfo: ExternalStudentInfo) => {
        if (externalInfo.school_name.trim() === '' ||
            externalInfo.status.trim() === '' ||
            externalInfo.classification.trim() === '' ||
            isNaN(externalInfo.academic_year) ||
            isNaN(externalInfo.average_result)||
            !externalInfo.grade
        ) {
            return false;
        }
        return true; // All required fields are provided
    };


    const saveInfo = async () => {
        setSubmitted(true);
        if (!validateExternalInfo(selectedExternalInfo)) {
            return;
        }
        let _extrnalInfos = [...(externalInfos as any)];
        try {
            if (selectedExternalInfo._id) {
                let id = selectedExternalInfo._id;
                const updatedInfo = await ExternalStudentInfoService.updateExternalStudentInfo(selectedExternalInfo);
                if (updatedInfo) {
                    const index = findIndexById(id);
                    _extrnalInfos[index] = selectedExternalInfo;
                }
            } else {
                const newInfo = await ExternalStudentInfoService.createExternalStudentInfo(selectedExternalInfo);
                if (newInfo) {
                    _extrnalInfos.push(newInfo);
                }
            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `Info ${selectedExternalInfo._id ? 'Updated' : 'Created'}`,
                life: 3000
            });

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: `Failed to ${selectedExternalInfo._id ? 'update' : 'create'} Info`,
                detail: '' + error,
                life: 3000
            });
        } finally {
            setShowSaveDialog(false);
            setSelectedExternalInfo(emptyExternalInfo);
            setExternalInfos(_extrnalInfos);
        }
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (externalInfos as any)?.length; i++) {
            if ((externalInfos as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const openSaveDialog = () => {
        setSelectedExternalInfo(emptyExternalInfo);        
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = async (externalInfo: ExternalStudentInfo) => {
        setSelectedExternalInfo({ ...externalInfo });
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const hideSaveDialog = () => {
        setShowSaveDialog(false);
        setSubmitted(false);
    };

    const saveDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" onClick={hideSaveDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveInfo} />
        </>
    );

    const deleteStudentInfo = async () => {
        try {
            if (selectedExternalInfo) {
                const deleted = await ExternalStudentInfoService.deleteExternalStudentInfo(selectedExternalInfo);
                if (deleted) {
                    let _infos = (externalInfos as any)?.filter((val: any) => val._id !== selectedExternalInfo._id);
                    setExternalInfos(_infos);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Info Deleted',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete info',
                detail: '' + error,
                life: 1500
            });
        }
        setShowRemoveDialog(false);
        setSelectedExternalInfo(emptyExternalInfo);
    }


    const confirmRemoveStudentInfo = (studentInfo: ExternalStudentInfo) => {
        setSelectedExternalInfo(studentInfo);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteStudentInfo} />
        </>
    );

    const renderExternalInfoFormContent = () => (
        <>

            <div className="form">
                {/* School Name */}
                <div className="field grid">
                    <label htmlFor="school_name" className="col-2 mb-0">School Name</label>
                    <div className="col-10">
                        <InputText
                            id="school_name"
                            value={selectedExternalInfo.school_name}
                            onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, school_name: e.target.value })}
                            required
                            className={classNames({
                                'p-invalid': submitted && !selectedExternalInfo.school_name,
                            })}
                        />
                        {submitted && !selectedExternalInfo.school_name && <small className="p-invalid">School Name is required.</small>}
                    </div>
                </div>
                <div className="field grid">
                    {/* Academic Year */}
                    <div className="col-6">
                        <div className="field grid">
                            <label htmlFor="academic_year" className="col-4 mb-0">Academic Year</label>
                            <div className="col-8">
                                <InputNumber
                                    id="academic_year"
                                    value={selectedExternalInfo.academic_year}
                                    onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, academic_year: e.value || 2000 })}
                                    mode="decimal" // Basic number mode
                                    useGrouping={false} // No thousand separator
                                    required
                                    className={classNames({
                                        'p-invalid': submitted && !selectedExternalInfo.academic_year,
                                    })}
                                />
                                {submitted && !selectedExternalInfo.academic_year && <small className="p-invalid">Academic Year is required.</small>}
                            </div>
                        </div>
                    </div>
                    {/* Classification */}
                    <div className="col-6">
                        <div className="field grid">
                            <label htmlFor="classification" className="col-4 mb-0">Classification</label>
                            <div className="col-8">
                                <Dropdown
                                    id="classification"
                                    value={selectedExternalInfo.classification}
                                    options={[{ label: 'Regular', value: 'REGULAR' }, { label: 'Evening', value: 'EVENING' }, { label: 'Distance', value: 'DISTANCE' }]}
                                    onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, classification: e.value })}
                                    required
                                    placeholder="Select Classification"
                                    className={classNames({
                                        'p-invalid': submitted && !selectedExternalInfo.classification,
                                    })}
                                />
                                {submitted && !selectedExternalInfo.classification && <small className="p-invalid">Classification is required.</small>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="field grid">
                    {/* Grade */}
                    <div className="col-6">
                        <div className="field grid">
                            <label htmlFor="grade" className="col-4 mb-0">Grade</label>
                            <div className="col-8" id="grade">
                                <Dropdown
                                    value={selectedExternalInfo.grade}
                                    onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, grade: e.value })}
                                    options={grades}
                                    itemTemplate={gradeTemplate}
                                    valueTemplate={selectedExternalInfo.grade ? gradeTemplate : ""}
                                    placeholder="Select a Grade"
                                    optionLabel="_id"
                                    filter
                                    className={classNames({
                                        'p-invalid': submitted && !selectedExternalInfo.grade,
                                    })}
                                />
                                {submitted && !selectedExternalInfo.grade && <small className="p-invalid">Grade is required.</small>}
                            </div>
                        </div>
                    </div>
                    {/* Average Result */}
                    <div className="col-6">
                        <div className="field grid">
                            <label htmlFor="average_result" className="col-4 mb-0">Average Result</label>
                            <div className="col-8">
                                <InputNumber
                                    id="average_result"
                                    value={selectedExternalInfo.average_result}
                                    onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, average_result: e.value || 0 })}
                                    min={0}
                                    max={100}
                                    required
                                    className={classNames({
                                        'p-invalid': submitted && (selectedExternalInfo.average_result == null || selectedExternalInfo.average_result < 0 || selectedExternalInfo.average_result > 100),
                                    })}
                                />
                                {submitted && (selectedExternalInfo.average_result == null || selectedExternalInfo.average_result < 0 || selectedExternalInfo.average_result > 100) && <small className="p-invalid">Average Result is required and must be between 0 and 100.</small>}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Status */}
                <div className="field grid">
                    <label htmlFor="status" className="col-2 mb-0">Status</label>
                    <div className="col-10">
                        <Dropdown
                            id="status"
                            value={selectedExternalInfo.status}
                            options={[{ label: 'Passed', value: 'PASSED' }, { label: 'Failed', value: 'FAILED' }, { label: 'Incomplete', value: 'INCOMPLETE' }]}
                            onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, status: e.value })}
                            required
                            placeholder="Select Status"
                            className={classNames({
                                'p-invalid': submitted && !selectedExternalInfo.status,
                            })}
                        />
                        {submitted && !selectedExternalInfo.status && <small className="p-invalid">Status is required.</small>}
                    </div>
                </div>

                {/* Transfer Reason */}
                <div className="field grid">
                    <label htmlFor="transferReason" className="col-2 mb-0">Transfer Reason</label>
                    <div className="col-10">
                        <InputText
                            id="transferReason"
                            value={selectedExternalInfo.transfer_reason || ''}
                            onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, transfer_reason: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Perior School Info of {`${props.student.first_name} ${props.student.last_name}`}</h5>
            {externalInfos.length == 0 &&
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <div className="my-2">
                        <Button icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                    </div>
                </span>
            }
        </div>
    );

    const actionBodyTemplate = (rowData: ExternalStudentInfo) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveStudentInfo(rowData)} />
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <DataTable
                        header={header}
                        value={externalInfos}
                        selection={selectedExternalInfo}
                        onSelectionChange={(e) => setSelectedExternalInfo(e.value)}
                        emptyMessage={`No rInfo found for ${props.student.first_name}.`}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="school_name" header="School" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="academic_year" header="Academic Year" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="classification" header="Classification" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="average_result" header="Average" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '550px' }}
                        header={'External Info Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        <div className="dialog-content">
                            {selectedExternalInfo && renderExternalInfoFormContent()}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={showRemoveDialog}
                        style={{ width: '450px' }}
                        header="Confirm to Delete Class"
                        modal
                        footer={removeDialogFooter}
                        onHide={hideRemoveDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedExternalInfo && (
                                <span>
                                    Are you sure you want to delete <b>{selectedExternalInfo._id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ExternalInfoComponent;