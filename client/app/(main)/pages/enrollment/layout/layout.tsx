'use client';
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { ClassificationGradeService } from '@/services/ClassificationGradeService';
import { ChildContainerProps } from '@/types';
import { AcademicSession, AdmissionClassification, ClassificationGrade } from '@/types/model';
import { classificationGradeTemplate } from '@/types/templates';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';

const Layout = ({ children }: ChildContainerProps) => {
    const toast = useRef<Toast>(null);
    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
    const [selectedAcademicSession, setSelectedAcademicSession] = useState<AcademicSession>();
    const [admissionClassifications, setAdmissionClassifications] = useState<AdmissionClassification[]>([]);
    const [selectedAdmissionClassification, setSelectedAdmissionClassification] = useState<AdmissionClassification>();
    const [classificationGrades, setClassificationGrades] = useState<ClassificationGrade[]>([]);
    //const [selectedClassificationGrade, setSelectedClassificationGrade] = useState<ClassificationGrade>();
    const { selectedClassificationGrade, setSelectedClassificationGrade } = useClassificationGrade();


    useEffect(() => {
        loadAcademicSessions();
    }, []);

    useEffect(() => {
        if (selectedAcademicSession) {
            try {
                AdmissionClassificationService.getAcademicSessionClassifications(selectedAcademicSession).then((data) => {
                    setAdmissionClassifications(data);
                });
            } catch (err) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load admission Classifications',
                    detail: '' + err,
                    life: 3000
                });
            }
        }
    }, [selectedAcademicSession]);

    useEffect(() => {
        if (selectedAdmissionClassification) {
            try {
                ClassificationGradeService.getClassificationGradesByClassification(selectedAdmissionClassification).then((data) => {
                    setClassificationGrades(data); // Update state with fetched data
                });
            } catch (err) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load Classification Grades',
                    detail: '' + err,
                    life: 3000
                });
            }
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

    return (
        <>
            <Toast ref={toast} />
            <div className="card p-fluid">
                <div className="grid">
                    <div className="col-12">
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
                                        itemTemplate={classificationGradeTemplate}
                                        valueTemplate={classificationGradeTemplate}
                                        optionLabel="_id"
                                        placeholder="Select a Grade"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <>{children}</>
        </>
    );
};
export default Layout;

