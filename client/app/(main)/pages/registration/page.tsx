'use client';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { AcademicSession, AdmissionClassification, Grade} from '@/types/model';
import { Dropdown } from 'primereact/dropdown';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
const RegistrationMainPage = () => {
    const toast = useRef<Toast>(null);
    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
    const [selectedAcademicSession, setSelectedAcademicSession] = useState<AcademicSession|null>();
    const [admissionClassifications, setAdmissionClassifications] = useState<AdmissionClassification[]>([]);
    const [selectedAdmissionClassification, setSelectedAdmissionClassification] = useState<AdmissionClassification | null>();
    const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);



    useEffect(() => {
        loadAcademicSessions();
    }, []);

    useEffect(() => {
        if (selectedAcademicSession) {
            loadAdmissionClassifications();
        }
    }, [selectedAcademicSession]); 

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

    const onAcademicSessionChanged = (value: AcademicSession) => {
        setSelectedAcademicSession(value);
        if (selectedAcademicSession) {
            //loadAdmissionClassifications(selectedAcademicSession);
        }
        setSelectedAdmissionClassification(null);
    }

    const onClassificationChanged = (value: AdmissionClassification) => {
        setSelectedAdmissionClassification(value);
        if (selectedAdmissionClassification) {
            //loadAdmissionClassifications();
        }
        setSelectedAdmissionClassification(null);
    }

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
                                            onAcademicSessionChanged(e.value)
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
                                        placeholder="Select Class."
                                    />
                                </div>
                            </div>
                            <div className="field col">
                                <label htmlFor="grade">Grade</label>
                                <div id="grade">
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
