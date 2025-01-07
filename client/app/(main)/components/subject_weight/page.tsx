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
        _id: '',
        grade_subject: props.gradeSubject._id,
        assessment_type: 'Quiz',
        assessment_weight: 5
    };

    const [subjectWeights, setSubjectWeights] = useState<SubjectWeight[]>([]);
    const [totalWeight, setTotalWeight] = useState<number>(0);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const total = subjectWeights.reduce((sum, item) => sum + item.assessment_weight, 0);
        setTotalWeight(total);
    }, [subjectWeights]);

    const saveSubjectWeights = async () => {
        if(totalWeight!==100){
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to set weights',
                detail: 'Total Weight Must Be 100, But You have given ' + totalWeight+'.',
                life: 3000
            });
            return
        }
    }


    const addNewRow = () => {
        setSubjectWeights([...subjectWeights, emptySubjectWeight]);
    };

    const onRowEditComplete = (e: any) => {
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
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} min={5} max={60} suffix="%" />
    }

    const startToolbarTemplate = () => {
        return (
            <>
                <Button icon="pi pi-plus" onClick={addNewRow} />
            </>
        );
    }
    const endToolbarTemplate = () => {
        return (
            <>
                <Button label='Save' severity="success" className="mr-2" onClick={saveSubjectWeights}/>
            </>
        );
    }    

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate} end={endToolbarTemplate}></Toolbar>
                    <DataTable
                        value={subjectWeights}
                        dataKey="_id"
                        editMode="row"
                        onRowEditComplete={onRowEditComplete}
                        emptyMessage={`No weights found.`}
                        footer={<>Total Weight: {totalWeight}</>}
                    >
                        <Column field="assessment_type" header="Type" editor={(options) => assesmentEditor(options)}></Column>
                        <Column field="assessment_weight" header="Weight" editor={(options) => weightEditor(options)}></Column>
                        <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
                    </DataTable>                   
                </div>
            </div>
        </div>
    );
};

export default SubjectWeightComponent;
