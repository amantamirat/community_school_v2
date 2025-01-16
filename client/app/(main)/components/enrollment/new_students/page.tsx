'use client';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { ClassificationGradeService } from '@/services/ClassificationGradeService';
import { CurriculumService } from '@/services/CurriculumService';
import { ExternalStudentInfoService } from '@/services/ExternalStudentInfoService';
import { GradeService } from '@/services/GradeService';
import { StudentGradeService } from '@/services/StudentGradeService';
import { AcademicSession, AdmissionClassification, ClassificationGrade, Curriculum, ExternalStudentInfo, Grade } from '@/types/model';
import { PrimeIcons } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
interface NewStudentsProps {
    classification_grade: ClassificationGrade;
}
const NewStudentsComponent = (props: NewStudentsProps) => {
    const toast = useRef<Toast>(null);
    const [selectedElligibleStudents, setSelectedElligibleStudents] = useState<ExternalStudentInfo[]>([]);
    const [elligibleStudents, setElligibleStudents] = useState<ExternalStudentInfo[]>([]);
    const [loading, setLoading] = useState(false);

    const getElligbleStudents = async () => {
        try {
            if (props.classification_grade) {
                setLoading(true);
                const data = await ExternalStudentInfoService.getExternalElligibleStudentsByGrade(props.classification_grade);
                setElligibleStudents(data);
                setLoading(false);
            }
        } catch (error) {

        }
    };

    const enrollExternalElligibleStudents = async () => {
        try {
            const data = await StudentGradeService.registerExternalStudents(props.classification_grade, selectedElligibleStudents);
            console.log(data);
        } catch (error) { 
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load academicSessions',
                detail: '' + error,
                life: 3000
            });
        }
    }

    const startToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Display Elligible Students" icon={PrimeIcons.EYE} severity="info" loading={loading} className="mr-2" onClick={getElligbleStudents} />
                </div>
            </>
        );
    };

    const endToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Enrol Selected Students" icon={PrimeIcons.CHECK_CIRCLE} severity="success" className="mr-2" disabled={selectedElligibleStudents.length == 0} onClick={enrollExternalElligibleStudents} />
                </div>
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <>
                        <Toolbar className="mb-4" start={startToolbarTemplate} end={endToolbarTemplate} />
                        <DataTable
                            value={elligibleStudents}
                            dataKey="_id"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                            emptyMessage="No students found."
                            scrollable
                            selectionMode="multiple"
                            selection={selectedElligibleStudents}
                            onSelectionChange={(e) => setSelectedElligibleStudents(e.value as any)}>
                            <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                            <Column
                                header="#"
                                body={(rowData, options) => options.rowIndex + 1}
                                style={{ width: '50px' }}
                            />
                            <Column field="student.first_name" header="First Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="student.last_name" header="Last Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="student.sex" header="Sex" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="student.birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="grade.stage" header="Grade stage" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="grade.level" header="Grade level" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="academic_year" header="Academic Year" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="status" header="Status" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        </DataTable>
                    </>
                </div>
            </div>
        </div>
    );
};

export default NewStudentsComponent;
