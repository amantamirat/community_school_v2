'use client';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { ClassificationGradeService } from '@/services/ClassificationGradeService';
import { CurriculumService } from '@/services/CurriculumService';
import { ExternalStudentInfoService } from '@/services/ExternalStudentInfoService';
import { GradeService } from '@/services/GradeService';
import { AcademicSession, AdmissionClassification, ClassificationGrade, Curriculum, ExternalStudentInfo, Grade } from '@/types/model';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
const RegistrationMainPage = () => {
    const toast = useRef<Toast>(null);
    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
    const [selectedAcademicSession, setSelectedAcademicSession] = useState<AcademicSession>();
    const [admissionClassifications, setAdmissionClassifications] = useState<AdmissionClassification[]>([]);
    const [selectedAdmissionClassification, setSelectedAdmissionClassification] = useState<AdmissionClassification>();
    const [classificationGrades, setClassificationGrades] = useState<ClassificationGrade[]>([]);
    const [selectedClassificationGrade, setSelectedClassificationGrade] = useState<ClassificationGrade>();
    const [elligibleStudents, setElligibleStudents] = useState<ExternalStudentInfo[]>([]);

    useEffect(() => {
        loadAcademicSessions();
    }, []);

    useEffect(() => {
        if (selectedAcademicSession) {
            loadAdmissionClassifications();
        }
    }, [selectedAcademicSession]);

    useEffect(() => {
        if (selectedAdmissionClassification) {
            loadClassificationGrades();
        }
    }, [selectedAdmissionClassification]);

    useEffect(() => {
        if (selectedAdmissionClassification) {
            loadClassificationGrades();
        }
    }, [selectedAdmissionClassification]);

    const loadAcademicSessions = async () => {
        try {
            const data = await AcademicSessionService.getAcademicSessions();
            setAcademicSessions(data);
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load academicSessions',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const loadAdmissionClassifications = async () => {
        try {
            const data = await AdmissionClassificationService.getAcademicSessionClassifications(selectedAcademicSession?._id || '');
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

    const loadClassificationGrades = async () => {
        try {
            const data = await ClassificationGradeService.getClassificationGradesByClassification(selectedAdmissionClassification?._id ?? '');
            setClassificationGrades(data); // Update state with fetched data
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load Classification Grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const getElligbleStudents = async () => {
        try {
            if (selectedClassificationGrade) {
                const data = await ExternalStudentInfoService.getExternalElligibleStudentsByGrade(selectedClassificationGrade);
                setElligibleStudents(data);
            }
        } catch (error) {

        }

    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="session">Academic Year</label>
                                <div id="session">
                                    <Dropdown
                                        value={selectedAcademicSession || null}
                                        onChange={(e) =>
                                            setSelectedAcademicSession(e.value)
                                        }
                                        options={academicSessions}
                                        optionLabel="academic_year"
                                        placeholder="Select Ac. Year"
                                    />
                                </div>
                            </div>
                            <div className="field col">
                                <label htmlFor="classification">Classification</label>
                                <div id="classification">
                                    <Dropdown
                                        value={selectedAdmissionClassification || null}
                                        onChange={(e) =>
                                            setSelectedAdmissionClassification(e.value)
                                        }
                                        options={admissionClassifications}
                                        optionLabel="classification"
                                        placeholder="Select Classfication"
                                    />
                                </div>
                            </div>
                            <div className="field col">
                                <label htmlFor="grade">Grade</label>
                                <div id="grade">
                                    <Dropdown
                                        value={selectedClassificationGrade || null}
                                        onChange={(e) =>
                                            setSelectedClassificationGrade(e.value)
                                        }
                                        options={classificationGrades}
                                        optionLabel="curriculum_grade"
                                        placeholder="Select Grade"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <TabView>
                        <TabPanel header="Enrollment">
                            <>
                                <Button label="Request" icon="pi pi-plus" severity="success" className="mr-2" onClick={getElligbleStudents} />
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
                                >
                                    <Column
                                        header="#"
                                        body={(rowData, options) => options.rowIndex + 1}
                                        style={{ width: '50px' }}
                                    />
                                    <Column field="student.first_name" header="First Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                                    <Column field="student.last_name" header="Last Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                                    <Column field="student.sex" header="Sex" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                                    <Column field="student.birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                                    <Column field="grade.stage" header="grade stage" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                                    <Column field="grade.level" header="grade level" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                                    <Column field="academic_year" header="Academic Year" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                                    <Column field="status" header="AStatus" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                                </DataTable>
                            </>

                        </TabPanel>
                        <TabPanel header="Registred">
                            <>Display registered student</>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default RegistrationMainPage;
