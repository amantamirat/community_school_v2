'use client';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { ClassificationGradeService } from '@/services/ClassificationGradeService';
import { AcademicSession, AdmissionClassification, ClassificationGrade } from '@/types/model';
import { Dropdown } from 'primereact/dropdown';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import GradeSectionComponent from '../../components/grade_section/page';
import SectionClassComponent from '../../components/section_class/page';
const SectionMainPage = () => {
    const toast = useRef<Toast>(null);
    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
    const [selectedAcademicSession, setSelectedAcademicSession] = useState<AcademicSession | null>(null);
    const [admissionClassifications, setAdmissionClassifications] = useState<AdmissionClassification[]>([]);
    const [selectedAdmissionClassification, setSelectedAdmissionClassification] = useState<AdmissionClassification | null>(null);
    const [classificationGrades, setClassificationGrades] = useState<ClassificationGrade[]>([]);
    const [selectedClassificationGrade, setSelectedClassificationGrade] = useState<ClassificationGrade | null>(null);

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
            const data = await ClassificationGradeService.getClassificationGradesByClassification(selectedAdmissionClassification?._id || '');
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
                                        value={selectedClassificationGrade}
                                        onChange={(e) =>
                                            setSelectedClassificationGrade(e.value)
                                        }
                                        options={classificationGrades}
                                        optionLabel="_id"
                                        placeholder="Select Grade"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <TabView>
                        <TabPanel header="Classes"
                            key={selectedClassificationGrade ? `${selectedClassificationGrade._id}_tab1` : '_tab1'}
                        >
                            {selectedClassificationGrade ? (
                                <SectionClassComponent classification_grade={selectedClassificationGrade} />
                            ) : (
                                <div>Please select a classification grade.</div>
                            )}
                        </TabPanel>
                        <TabPanel header="Sections"
                            key={selectedClassificationGrade ? `${selectedClassificationGrade._id}_tab2` : '_tab2'}
                        >
                            {selectedClassificationGrade ? (
                                <GradeSectionComponent classification_grade={selectedClassificationGrade} />
                            ) : (
                                <div>Please select a classification grade.</div>
                            )}
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default SectionMainPage;
