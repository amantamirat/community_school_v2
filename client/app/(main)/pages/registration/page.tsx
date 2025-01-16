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
import NewExternalStudentsComponent from '../../components/enrollment/new_students/page';
import RegisteredStudentsComponent from '../../components/enrollment/registerd_students/page';
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
                        <TabPanel header="Returning">
                            <>
                            </>
                        </TabPanel>
                        <TabPanel header="New (External)">
                            {selectedClassificationGrade ? (
                                <NewExternalStudentsComponent classification_grade={selectedClassificationGrade} />) : (
                                <div>Please select a classification grade.</div>
                            )}
                        </TabPanel>
                        <TabPanel header="Registred">
                            {selectedClassificationGrade ? (
                                <RegisteredStudentsComponent classification_grade={selectedClassificationGrade} />) : (
                                <div>Please select a classification grade.</div>
                            )}
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default RegistrationMainPage;
