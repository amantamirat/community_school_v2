"use client"
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { SectionClassService } from '@/services/SectionClassService';
import { StudentClassService } from '@/services/StudentClassService';
import { StudentResultService } from '@/services/StudentResultService';
import { SubjectWeightService } from '@/services/SubjectWeightService';
import { GradeSection, GradeSubject, SectionClass, StudentClass, StudentResult, SubjectTerm, SubjectWeight } from '@/types/model';
import { stat } from 'fs';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
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
    const [sectionClasss, setSectionClasss] = useState<SectionClass[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const [selectedSectionClass, setSelectedSectionClass] = useState<SectionClass | undefined>(undefined);
    const [subjectWeights, setSubjectWeights] = useState<SubjectWeight[]>([]);
    const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
    const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
    const [resultEntries, setResultEntries] = useState<ResultEntry[]>([]);
    const queueStudentResults = useRef<StudentResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [status, setStatus] = useState<"Disapprove" | "Submit" | "Approve">("Submit");
    const [showSubmitDialog, setShowConfirmationDialog] = useState(false);


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
            SectionClassService.getActiveSectionClasssByGradeSection(selectedGradeSection).then((data) => {
                setSectionClasss(data);
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
        if (selectedSectionClass) {
            StudentClassService.getStudentClasssBySectionClass(selectedSectionClass).then((data) => {
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

            StudentResultService.getStudentResultsBySectionClass(selectedSectionClass).then((data) => {
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

            SubjectWeightService.getSubjectWeights((selectedSectionClass.subject_term as SubjectTerm).grade_subject as GradeSubject).then((data) => {
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
            queueStudentResults.current.length = 0;
        }

    }, [selectedSectionClass]);

    useEffect(() => {
        if (studentClasses.length > 0 && subjectWeights.length > 0) {
            setResultEntries(prepareResultEntries());
        }
    }, [studentClasses, studentResults, subjectWeights]);


    const saveStudentResults = async () => {
        if (queueStudentResults.current.length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Nothing to update',
                detail: 'You havent update any results',
                life: 1500
            });
            return;
        }
        try {
            setLoading(true);
            const data = await StudentResultService.updateStudentResults(queueStudentResults.current);
            if (data.length > 0) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: `${data.length} Results Saved`,
                    life: 1500
                });
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

    const updateStudentResultsState = async () => {
        try {

            if (selectedSectionClass) {
                switch (selectedSectionClass.status) {
                    case 'ACTIVE':
                        setLoading1(true);
                        let total_results = subjectWeights.length * studentClasses.length;
                        let _studentResults = await StudentResultService.getStudentResultsBySectionClass(selectedSectionClass);
                        let entered_results = _studentResults.length;
                        let entered_percentage = (entered_results / total_results) * 100;
                        if (entered_percentage < 75) {
                            throw new Error('At least 75% result must be saved. Please enter results and save all first!');
                        }
                        const data = await StudentResultService.submitStudentResults(selectedSectionClass);
                        if (data) {
                            //console.log(data);
                            const _studentClass = await StudentClassService.getStudentClasssBySectionClass(selectedSectionClass);
                            //const _selectedClass = { ...selectedSectionClass, status: 'SUBMITTED' as 'SUBMITTED' | 'ACTIVE' | 'APPROVED' | 'PENDING' };
                            setSelectedSectionClass({ ...selectedSectionClass, status: 'SUBMITTED' });
                            setStudentClasses(_studentClass);
                            toast.current?.show({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Results Submitted',
                                life: 1500
                            });
                        }
                        break;
                    case 'SUBMITTED':
                        switch (status) {
                            case 'Disapprove':
                                const data = await StudentResultService.activateStudentResults(selectedSectionClass);
                                if (data) {
                                    //console.log(data);
                                    const _studentClass = await StudentClassService.getStudentClasssBySectionClass(selectedSectionClass);
                                    setSelectedSectionClass({ ...selectedSectionClass, status: 'ACTIVE' });
                                    setStudentClasses(_studentClass);
                                    toast.current?.show({
                                        severity: 'success',
                                        summary: 'Successful',
                                        detail: 'Results Back to Activated',
                                        life: 1500
                                    });
                                }
                            case 'Submit':
                            case 'Approve':
                        }
                        break;
                    case 'APPROVED':
                        break;
                    case 'PENDING':
                        break
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to update results',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading1(false);
            setShowConfirmationDialog(false);
        }
    }

    const openStateDialog = (status: "Disapprove" | "Submit" | "Approve") => {
        setStatus(status);
        setShowConfirmationDialog(true);
    };

    const hideSubmitDialog = () => {
        setShowConfirmationDialog(false);
    };

    const submitDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideSubmitDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={updateStudentResultsState} />
        </>
    );

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
        //const { rowData, field, newValue } = e; // `rowData` is the current row, `field` is the edited column, `newValue` is the new value
        let { rowData, newValue, field, originalEvent: event } = e;

        if (!newValue) {
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

            case 'PENDING':
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
                {selectedSectionClass?.status === "ACTIVE" ? <Button label='Save All' text loading={loading} onClick={saveStudentResults} /> : <></>}
            </span>
        </div>
    );

    const footer = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            {selectedSectionClass?.status === "ACTIVE" ? <><></><Button label='Submit' onClick={() => openStateDialog("Submit")} loading={loading1} /> </> :
                selectedSectionClass?.status === "SUBMITTED" ? <><Button label='Approve' severity='success' onClick={() => openStateDialog("Approve")} loading={loading1} /><Button label='Disapprove' onClick={() => openStateDialog("Disapprove")} severity='danger' loading={loading} /></>
                    : <></>}
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
                                    />
                                </div>
                            </div>
                            <div className="field col">
                                <label htmlFor="subject">Subject</label>
                                <div id="subject">
                                    <Dropdown
                                        value={selectedSectionClass || null}
                                        onChange={(e) =>
                                            setSelectedSectionClass(e.value)
                                        }
                                        options={sectionClasss}
                                        optionLabel="subject_term.grade_subject.subject.title"
                                        placeholder="Select Class"
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
                                        const isEditable = selectedSectionClass?.status === 'ACTIVE';
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
                        <Dialog
                            visible={showSubmitDialog}
                            style={{ width: '450px' }}
                            header={`Confirm to ${status} Student Result`}
                            modal
                            footer={submitDialogFooter}
                            onHide={hideSubmitDialog}
                        >
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {selectedGradeSection && (
                                    <span>
                                        Are you sure you want to {status} <b>{selectedSectionClass?._id}</b>?
                                    </span>
                                )}
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResultEntryPage;
