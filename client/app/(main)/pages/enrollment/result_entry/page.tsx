"use client"
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { SectionSubjectService } from '@/services/SectionSubjectService';
import { StudentClassService } from '@/services/StudentClassService';
import { StudentResultService } from '@/services/StudentResultService';
import { SubjectWeightService } from '@/services/SubjectWeightService';
import { TermClassService } from '@/services/TermClassService';
import { GradeSection, GradeSubject, SectionSubject, StudentClass, StudentResult, SubjectTerm, SubjectWeight, TermClass } from '@/types/model';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';


type ResultEntry = {
    student_class: StudentClass;
} & {
    [weight_id: string]: number | null | StudentClass;
};

const ResultEntryPage = () => {
    const toast = useRef<Toast>(null);
    const { selectedClassificationGrade } = useClassificationGrade();
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [sectionSubjects, setSectionSubjects] = useState<SectionSubject[]>([]);
    const [termClasses, setTermClasses] = useState<TermClass[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const [selectedSectionSubject, setSelectedSectionSubject] = useState<SectionSubject | undefined>(undefined);
    const [selectedTermClass, setSelectedTermClass] = useState<TermClass | undefined>(undefined);
    const [subjectWeights, setSubjectWeights] = useState<SubjectWeight[]>([]);
    const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
    const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
    const [resultEntries, setResultEntries] = useState<ResultEntry[]>([]);
    const queueStudentResults = useRef<StudentResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);
    const [loading4, setLoading4] = useState(false);


    useEffect(() => {
        if (selectedClassificationGrade) {
            GradeSectionService.getGradeSectionsByClassificationGrade(selectedClassificationGrade).then((data) => {
                setGradeSections(data);
            }).catch((e) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load sections',
                    detail: '' + e,
                    life: 3000
                });
            }).finally(() => {
                setSelectedGradeSection(null);
            });
        }
    }, [selectedClassificationGrade]);

    useEffect(() => {
        if (selectedGradeSection) {
            SectionSubjectService.getSectionClasssByGradeSection(selectedGradeSection).then((data) => {
                setSectionSubjects(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load section class',
                    detail: '' + err,
                    life: 3000
                });
            });
        }
    }, [selectedGradeSection]);

    useEffect(() => {
        if (selectedSectionSubject) {
            TermClassService.getTermClassesBySubject(selectedSectionSubject).then((data) => {
                setTermClasses(data);
                //console.log(data);
            }).catch((err) => {
                setStudentClasses([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load Terms',
                    detail: '' + err,
                    life: 3000
                });
            });

            SubjectWeightService.getSubjectWeights(selectedSectionSubject.grade_subject as GradeSubject).then((data) => {
                if (data.length === 0) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Failed to load subject weights',
                        detail: "Weights are not setted. Please set weights in the curriculum.",
                        life: 3000
                    });
                    setStudentResults([]);
                }
                setSubjectWeights(data);
            }).catch((err) => {
                setSubjectWeights([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load subject weights',
                    detail: '' + err,
                    life: 3000
                });
            });
        }
    }, [selectedSectionSubject]);



    useEffect(() => {
        if (selectedTermClass) {
            queueStudentResults.current.length = 0;
            StudentClassService.getStudentClasssBySectionClass(selectedTermClass).then((data) => {
                if (data.length === 0) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Empty Student Classes',
                        detail: "No registred students for this class are found.",
                        life: 3000
                    });
                }
                setStudentClasses(data);
            }).catch((err) => {
                setStudentClasses([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load registred students',
                    detail: '' + err,
                    life: 3000
                });
            });

            StudentResultService.getStudentResultsByTerm(selectedTermClass).then((data) => {
                setStudentResults(data);
            }).catch((err) => {
                setStudentResults([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to student results',
                    detail: '' + err,
                    life: 3000
                });
            });
        }
    }, [selectedTermClass])


    useEffect(() => {
        if (studentClasses.length > 0 && subjectWeights.length > 0) {
            setResultEntries(prepareResultEntries());
        }
    }, [studentClasses, studentResults, subjectWeights, selectedTermClass, selectedSectionSubject]);


    const saveStudentResults = async () => {
        try {
            if (!selectedTermClass) {
                return;
            }
            if (selectedSectionSubject?.status !== 'ACTIVE') {
                throw new Error("Non Active Class Can not be Saved!");
            }
            if (queueStudentResults.current.length === 0) {
                throw new Error("You havent update any results");
            }
            setLoading(true);
            const data = await StudentResultService.updateStudentResults(queueStudentResults.current, selectedTermClass);
            if (data.length > 0) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: `${data.length} Results Saved`,
                    life: 1500
                });
                queueStudentResults.current.length = 0;
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to update results',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
    }


    const submitStudentResults = async () => {
        try {
            if (selectedTermClass) {
                if (selectedTermClass.status !== 'ACTIVE') {
                    throw new Error("Non Active Class Can not be Submitted");
                }
                setLoading1(true);
                let total_results = subjectWeights.length * studentClasses.length;
                let _studentResults = await StudentResultService.getStudentResultsByTerm(selectedTermClass);
                let entered_results = _studentResults.length;
                let entered_percentage = (entered_results / total_results) * 100;
                if (entered_percentage < 75) {
                    throw new Error('At least 75% result must be saved. Please enter results and save all first!');
                }
                const data = await TermClassService.submitStudentResults(selectedTermClass);
                if (data.status == "SUBMITTED") {
                    const _studentClass = await StudentClassService.getStudentClasssBySectionClass(selectedTermClass);
                    setStudentClasses(_studentClass);
                    let _termClasses = [...termClasses];
                    const index = termClasses.findIndex((term) => term._id === selectedTermClass._id);
                    _termClasses[index] = { ...selectedTermClass, status: 'SUBMITTED' };
                    setTermClasses(_termClasses);
                    setSelectedTermClass(_termClasses[index]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Results Submitted',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to submit results',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading1(false);
        }
    }

    const approveStudentResults = async () => {
        try {
            if (selectedTermClass && selectedSectionSubject) {
                if (selectedTermClass.status !== 'SUBMITTED') {
                    throw new Error("Non Submitted Class Can not be Approved");
                }
                setLoading2(true);
                const data = await TermClassService.approveStudentResults(selectedTermClass);
                if (data.status === "APPROVED") {
                    let _termClasses = [...termClasses];
                    const index = termClasses.findIndex((termClass) => termClass._id === selectedTermClass._id);
                    _termClasses[index] = { ...selectedTermClass, status: 'APPROVED' };
                    const nextIndex = termClasses.findIndex((termClass) =>
                        (termClass.subject_term as SubjectTerm).term === (selectedTermClass.subject_term as SubjectTerm).term + 1
                    );
                    if (nextIndex === -1) {
                        let _sectionSubjects = [...sectionSubjects];
                        const subIndex = sectionSubjects.findIndex((secSubject) => secSubject._id === selectedSectionSubject._id);
                        _sectionSubjects[subIndex] = { ...selectedSectionSubject, status: 'CLOSED' };
                        setSectionSubjects(_sectionSubjects);
                        setSelectedSectionSubject(_sectionSubjects[subIndex]);
                    } else {
                        _termClasses[nextIndex] = { ...termClasses[nextIndex], status: 'ACTIVE' };
                    }
                    setTermClasses(_termClasses);
                    setSelectedTermClass(_termClasses[index]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Results Approved',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to approve results',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading2(false);
        }
    }

    const activateStudentResults = async () => {
        try {
            if (selectedTermClass) {
                if (selectedTermClass.status !== 'SUBMITTED') {
                    throw new Error("Non Submitted Class Can not be Activated");
                }
                setLoading3(true);
                const data = await TermClassService.activateStudentResults(selectedTermClass);
                if (data.status === "ACTIVE") {
                    const _studentClass = await StudentClassService.getStudentClasssBySectionClass(selectedTermClass);
                    setStudentClasses(_studentClass);
                    let _sectionClasses = [...termClasses];
                    const index = termClasses.findIndex((section) => section._id === selectedTermClass._id);
                    _sectionClasses[index] = { ...selectedTermClass, status: 'ACTIVE' };
                    setTermClasses(_sectionClasses);
                    setSelectedTermClass(_sectionClasses[index]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Results Back to Activated',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to activate results',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading3(false);
        }
    }


    const revokeStudentResults = async () => {
        try {
            if (selectedTermClass && selectedSectionSubject && selectedGradeSection) {
                if (selectedGradeSection.status !== 'OPEN') {
                    throw new Error("Closed Section Class Can not be Revoked");
                }
                if (selectedTermClass.status !== 'APPROVED') {
                    throw new Error("Non Approved Class Can not be Revoked");
                }
                setLoading4(true);
                const data = await TermClassService.revokeStudentResults(selectedTermClass);
                if (data.status === "SUBMITTED") {
                    let _termClasses = [...termClasses];
                    const index = termClasses.findIndex((termClass) => termClass._id === selectedTermClass._id);
                    _termClasses[index] = { ...selectedTermClass, status: 'SUBMITTED' };
                    const nextIndex = termClasses.findIndex((termClass) =>
                        (termClass.subject_term as SubjectTerm).term === (selectedTermClass.subject_term as SubjectTerm).term + 1
                    );
                    if (nextIndex === -1) {
                        let _sectionSubjects = [...sectionSubjects];
                        const subIndex = sectionSubjects.findIndex((secSubject) => secSubject._id === selectedSectionSubject._id);
                        _sectionSubjects[subIndex] = { ...selectedSectionSubject, status: 'ACTIVE' };
                        setSectionSubjects(_sectionSubjects);
                        setSelectedSectionSubject(_sectionSubjects[subIndex]);
                    } else {
                        _termClasses[nextIndex] = { ...termClasses[nextIndex], status: 'PENDING' };
                    }
                    setTermClasses(_termClasses);
                    setSelectedTermClass(_termClasses[index]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Results Revoked',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to revoke class',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading4(false);
        }
    }


    const prepareResultEntries = (): ResultEntry[] => {
        return studentClasses.map(studentClass => {
            const resultsForStudent = studentResults.filter(
                result => result.student_class === studentClass._id
            );
            const entry: ResultEntry = {
                student_class: studentClass,
            };
            subjectWeights.forEach(weight => {
                const result = resultsForStudent.find(
                    res => res.subject_weight === weight._id
                );
                weight._id ? entry[weight?._id] = result ? result.result : null : null
            });
            return entry;
        });
    };

    const onCellEditComplete = (e: any) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        if (!newValue && newValue !== 0) {
            event.preventDefault();
            return
        }
        rowData[field] = newValue;
        const newResult: StudentResult = {
            student_class: rowData.student_class._id,
            subject_weight: field,
            result: newValue,
            status: 'ACTIVE',
        };
        const index = findIndex(newResult);
        if (index === -1) {
            queueStudentResults.current.push(newResult);
        } else {
            queueStudentResults.current[index] = newResult;
        }
    };

    const findIndex = (result: StudentResult) => {
        return queueStudentResults.current.findIndex(
            (item) => item.student_class === result.student_class &&
                item.subject_weight === result.subject_weight
        );
    };


    const calculateRowTotal = (rowData: any): number => {
        const values = Object.values(rowData);
        const total = values.reduce((sum: number, value) => {
            if (typeof value === "number" && !isNaN(value)) {
                return sum + value;
            }
            return sum;
        }, 0);
        return total;
    };

    const getSeverity = (value: string) => {
        switch (value) {
            case 'COMPLETED':
                return 'success';

            case 'ACTIVE':
                return 'info';

            case 'INCOMPLETE':
                return 'danger';

            default:
                return null;
        }
    };

    const statusBodyTemplate = (rowData: ResultEntry) => {
        return <Tag value={rowData.student_class.status} severity={getSeverity(rowData.student_class.status)}></Tag>;
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Student Results</h5>
            <span className="block mt-2">
                {selectedTermClass?.status === "ACTIVE" ?
                    <>
                        <Button label='Save All' text loading={loading} onClick={saveStudentResults} style={{ marginRight: '10px' }} />
                        <Button label='Submit' severity='secondary' onClick={submitStudentResults} loading={loading1} style={{ marginRight: '10px' }} />
                    </> : selectedTermClass?.status === "SUBMITTED" ?
                        <>
                            <Button label='Approve' severity='success' onClick={approveStudentResults} loading={loading2} style={{ marginRight: '10px' }} />
                            <Button label='Activate' severity='warning' onClick={activateStudentResults} loading={loading3} style={{ marginRight: '10px' }} />
                        </> : selectedTermClass?.status === "APPROVED" ?
                            <>
                                <Button label='Revoke' severity='danger' onClick={revokeStudentResults} loading={loading4} />
                            </> : <></>}
            </span>
        </div>
    );

    const footer = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <>Subject:{selectedSectionSubject?.status}, Term: {selectedTermClass?.status} ... Call 0918146042</>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <div className="card p-fluid">
                <div className="grid">
                    <div className="col-12">
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="section">Section</label>
                                <div id="section">
                                    <Dropdown
                                        value={selectedGradeSection || null}
                                        onChange={(e) =>
                                            setSelectedGradeSection(e.value)
                                        }
                                        options={gradeSections.map((item) => ({
                                            ...item,
                                            section_number: `Section ${item.section_number}`,
                                        }))}
                                        optionLabel="section_number"
                                        placeholder="Select Section"
                                        emptyMessage="No Sections Found"
                                    />
                                </div>
                            </div>
                            <div className="field col">
                                <label htmlFor="subject">Subject</label>
                                <div id="subject">
                                    <Dropdown
                                        value={selectedSectionSubject || null}
                                        onChange={(e) =>
                                            setSelectedSectionSubject(e.value)
                                        }
                                        options={sectionSubjects}
                                        optionLabel="grade_subject.subject.title"
                                        placeholder="Select Class"
                                        emptyMessage="No Subjects Found"
                                    />
                                </div>
                            </div>

                            <div className="field col">
                                <label htmlFor="term">Term</label>
                                <div id="term">
                                    <Dropdown
                                        value={selectedTermClass || null}
                                        onChange={(e) =>
                                            setSelectedTermClass(e.value)
                                        }
                                        options={termClasses}
                                        optionLabel="subject_term.term"
                                        placeholder="Select Term"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <DataTable
                            value={resultEntries}
                            header={header}
                            footer={footer}
                            stripedRows
                            scrollable
                            editMode="cell"
                            dataKey='student_class._id'
                        >
                            <Column header="#" body={(rowData, options) => options.rowIndex + 1} style={{ width: '50px' }} />
                            <Column
                                field='student_class.student_grade.student.first_name'
                                header="Student"
                                body={(rowData) => `${rowData.student_class.student_grade.student.first_name} ${rowData.student_class.student_grade.student.last_name}`}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
                                frozen
                            />
                            {subjectWeights.map(weight => (
                                <Column
                                    key={weight._id}
                                    field={weight._id}
                                    header={`${weight.assessment_type} (${weight.assessment_weight}%)`}
                                    editor={(options) => {
                                        const isEditable = selectedTermClass?.status === 'ACTIVE';
                                        if (!isEditable) {
                                            return <span>{options.value}</span>;
                                        }
                                        // If editable, render InputNumber
                                        return (
                                            <InputNumber
                                                value={options.value}
                                                onValueChange={(e) => {
                                                    if (options.editorCallback) {
                                                        options.editorCallback(e.value);
                                                    }
                                                }}
                                                mode="decimal"
                                                maxFractionDigits={5}
                                                min={0}
                                                max={weight.assessment_weight}
                                                useGrouping={false}
                                                disabled={!isEditable}
                                            />
                                        );
                                    }}
                                    onCellEditComplete={onCellEditComplete}
                                />
                            ))}
                            <Column
                                header="Total"
                                body={(rowData) => calculateRowTotal(rowData)} // Function to calculate and display the total
                                style={{ fontWeight: 'bold', textAlign: 'right' }}
                            />
                            <Column
                                field='student_class.status'
                                header="Status"
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
                                body={statusBodyTemplate}
                            />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResultEntryPage;
