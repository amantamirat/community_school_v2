import { SubjectWeightService } from '@/services/SubjectWeightService';
import { GradeSubject, SubjectWeight } from '@/types/model';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';

interface SubjectWeightProps {
    gradeSubject: GradeSubject;
}

const SubjectWeightComponent = (props: SubjectWeightProps) => {
    let emptySubjectWeight: SubjectWeight = {
        grade_subject: props.gradeSubject._id,
        assessment_type: 'Quiz',
        assessment_weight: 5
    };

    const [subjectWeights, setSubjectWeights] = useState<SubjectWeight[]>([]);
    const [totalWeight, setTotalWeight] = useState<number>(0);
    const toast = useRef<Toast>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        loadSubjectWeights();
    }, []);

    useEffect(() => {
        const total = subjectWeights.reduce((sum, item) => sum + item.assessment_weight, 0);
        setTotalWeight(total);
    }, [subjectWeights]);

    const loadSubjectWeights = async () => {
        try {
            const data = await SubjectWeightService.getSubjectWeights(props.gradeSubject._id);
            console.log(data)
            setSubjectWeights(data);
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load subject weights',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const hasValidId = () => {
        return subjectWeights.some(
            (item) => typeof item._id === 'string' && item._id.trim().length > 0
        );
    };

    const saveSubjectWeights = async () => {
        if (totalWeight !== 100) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to set weights',
                detail: 'Total Weight Must Be 100, But You have given ' + totalWeight + '.',
                life: 3000
            });
            return
        }
        try {
            //console.log(subjectWeights);
            const newSubjectWeights = await SubjectWeightService.createSubjectWeights(subjectWeights);
            setSubjectWeights(newSubjectWeights);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Subject Weight Setted',
                life: 1500
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to add subjects',
                detail: '' + error,
                life: 1500
            });
        }
    }

    const deleteWeights = async () => {
        try {
            const deleted = await SubjectWeightService.deleteSubjectWeights(props.gradeSubject._id);
            if (deleted) {
                setSubjectWeights([]);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Weights Deleted',
                    life: 3000
                });
            }
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete Weights',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);

    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const confirmDeleteItem = () => {       
        setShowDeleteDialog(true);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteWeights} />
        </>
    );

    const addNewRow = () => {
        setSubjectWeights([...subjectWeights, emptySubjectWeight]);
    };

    const onRowEditComplete = (e: any) => {
        if (hasValidId()) {
            return
        }
        let _subjectWeights = [...subjectWeights];
        let { newData, index } = e;
        _subjectWeights[index] = newData;
        setSubjectWeights(_subjectWeights);
    };

    const assesmentEditor = (options: any) => {
        return (
            <Dropdown
                value={options.value}
                options={['Quiz', 'Assignment', 'Test', 'Mid-Exam', 'Final-Exam']}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select a Status"

            />);
    }

    const weightEditor = (options: any) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} min={5} max={60} style={{ width: '50px' }} />
    }

    const startToolbarTemplate = () => {
        return (
            <>
                {hasValidId() ? (
                    <></>
                ) : (
                    <Button icon="pi pi-plus" onClick={addNewRow} />
                )}
            </>
        );
    }
    const endToolbarTemplate = () => {
        return (
            <>
                {hasValidId() ? (
                    <Button label='Delete' severity="danger" className="mr-2" onClick={confirmDeleteItem} />
                ) : (
                    <Button label='Save' severity="success" className="mr-2" onClick={saveSubjectWeights} />
                )}

            </>
        );
    }

    const allowEdit = (rowData: SubjectWeight) => {
        return !rowData._id
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate} end={endToolbarTemplate}></Toolbar>
                    <DataTable
                        value={subjectWeights}
                        dataKey="_sw_id"
                        editMode="row"
                        onRowEditComplete={onRowEditComplete}
                        emptyMessage={`No weights found.`}
                        footer={<>Total Weight: {totalWeight} %</>}                    >
                        <Column field="assessment_type" header="Type" editor={(options) => assesmentEditor(options)}></Column>
                        <Column field="assessment_weight" header="Weight" editor={(options) => weightEditor(options)}></Column>
                        <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
                    </DataTable>

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
                            {hasValidId() && (
                                <span>
                                    Are you sure you want to delete <b>{props.gradeSubject._id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default SubjectWeightComponent;
