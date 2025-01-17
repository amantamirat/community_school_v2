'use client';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { ClassificationGradeService } from '@/services/ClassificationGradeService';
import { AcademicSession, AdmissionClassification, ClassificationGrade, CurriculumGrade } from '@/types/model';
import { Dropdown } from 'primereact/dropdown';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import NewStudentsComponent from '../../components/enrollment/new_students/page';
import RegisteredStudentsComponent from '../../components/enrollment/registerd_students/page';
import NewExternalStudentsComponent from '../../components/enrollment/external_students/page';
import { GradeService } from '@/services/GradeService';
import { gradeTemplate } from '@/types/templates';
const RegistrationMainPage = () => {
    const toast = useRef<Toast>(null);
    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
    const [selectedAcademicSession, setSelectedAcademicSession] = useState<AcademicSession>();
    const [admissionClassifications, setAdmissionClassifications] = useState<AdmissionClassification[]>([]);
    const [selectedAdmissionClassification, setSelectedAdmissionClassification] = useState<AdmissionClassification>();
    const [classificationGrades, setClassificationGrades] = useState<ClassificationGrade[]>([]);
    const [selectedClassificationGrade, setSelectedClassificationGrade] = useState<ClassificationGrade>();

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
            //console.log(data);
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

    const renderGradeTemplate = (classificationGrade: ClassificationGrade) => {
        if (!classificationGrade) {
            return <span>Please select a grade</span>;
        }
        const curriculumGrade = classificationGrade?.curriculum_grade;
        if (typeof curriculumGrade === "object" && curriculumGrade !== null) {
            const grade = curriculumGrade.grade;
            if (typeof grade === "object" && grade !== null) {
                return gradeTemplate(grade);
            }
        }
        return <span>{"N/A"}</span>; // Fallback if gradeLabel is undefined
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
                                        itemTemplate={renderGradeTemplate}
                                        valueTemplate={renderGradeTemplate}
                                        optionLabel="_id"
                                        placeholder="Select a Grade"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <TabView>
                        <TabPanel header="Returning" leftIcon="pi pi-replay mr-2">
                            <>
                            </>
                        </TabPanel>
                        <TabPanel header="New (External)" leftIcon="pi pi-external-link mr-2">
                            {selectedClassificationGrade ? (
                                <NewExternalStudentsComponent classification_grade={selectedClassificationGrade} />) : (
                                <div>Please select a classification grade.</div>
                            )}
                        </TabPanel>
                        <TabPanel header="New (First Level)" leftIcon="pi pi-user-plus mr-2">
                            <NewStudentsComponent classification_grade={selectedClassificationGrade} />
                        </TabPanel>
                        <TabPanel header="Registred" leftIcon="pi pi-users mr-2">
                            {selectedClassificationGrade ? (
                                <RegisteredStudentsComponent classification_grade={selectedClassificationGrade} />) : (
                                <div>Please select a classification grade.</div>
                            )}
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div >
    );
};

export default RegistrationMainPage;
