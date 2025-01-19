'use client';
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { StudentGradeService } from '@/services/StudentGradeService';
import { StudentGrade } from '@/types/model';
import { PickList } from 'primereact/picklist';
import { useEffect, useState } from 'react';



const StudentSectionComponent = () => {
    const [source1, setSource1] = useState<StudentGrade[]>([]);
    const [target1, setTarget1] = useState<StudentGrade[]>([]);
    const { selectedClassificationGrade} = useClassificationGrade();
    
    useEffect(() => {
        if (selectedClassificationGrade) {
            StudentGradeService.getRegisteredStudents(selectedClassificationGrade).then((data) => setSource1(data));
        }
    }, [selectedClassificationGrade]);


    const onChange = (event: any) => {
        setSource1(event.source);
        setTarget1(event.target);
    };

    const itemTemplate = (item: StudentGrade) => {
        return (
            <>{item._id}</>
        );
    };

    return (
        <div className="card">
            <PickList dataKey="_id" source={source1} target={target1} onChange={onChange} itemTemplate={itemTemplate} filter filterBy="first_name" breakpoint="1280px"
                sourceHeader="Available" targetHeader="Selected" sourceStyle={{ height: '24rem' }} targetStyle={{ height: '24rem' }}
                sourceFilterPlaceholder="Search by first name" targetFilterPlaceholder="Search by name" />
        </div>
    );
};

export default StudentSectionComponent;
