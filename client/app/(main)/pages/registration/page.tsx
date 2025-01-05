'use client';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { CurriculumService } from '@/services/CurriculumService';
import { GradeService } from '@/services/GradeService';
import { AcademicSession, AdmissionClassification, Curriculum, Grade } from '@/types/model';
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
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [curriculumGrades, setCurriculumGrades] = useState<Grade[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<Grade>();

    useEffect(() => {
        loadAcademicSessions();
        loadCurriculums();
        loadGrades();
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

    const loadGrades = async () => {
        try {
            const data = await GradeService.getGrades();
            setGrades(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load grades:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load grades',
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
            const gradeStrings = curriculums
                .find(curriculum => curriculum._id === selectedAdmissionClassification?.curriculum)
                ?.grades.map(gradeObj => gradeObj.grade) || [];
            const curriculumGrades = grades.filter(grade =>
                gradeStrings.includes(grade._id as string));
            setCurriculumGrades(curriculumGrades);
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load Grades of Classifications',
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
                                        optionLabel="_id"
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
                                        optionLabel="_id"
                                        placeholder="Select Classfication"
                                    />
                                </div>
                            </div>
                            <div className="field col">
                                <label htmlFor="grade">Grade</label>
                                <div id="grade">
                                    <Dropdown
                                        value={selectedGrade || null}
                                        onChange={(e) =>
                                            setSelectedGrade(e.value)
                                        }
                                        options={curriculumGrades}
                                        optionLabel="_id"
                                        placeholder="Select Grade"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <TabView>
                        <TabPanel header="Enrollment">
                            <>Display elligible student</>
                        </TabPanel>
                        <TabPanel header="Registred">
                            <>Display registered student</>
                        </TabPanel>
                        <TabPanel header="Students">
                            <>Manage students</>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default RegistrationMainPage;
