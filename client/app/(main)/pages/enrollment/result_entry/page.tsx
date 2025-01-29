"use client"
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { SectionClassService } from '@/services/SectionClassService';
import { StudentClassService } from '@/services/StudentClassService';
import { StudentResultService } from '@/services/StudentResultService';
import { SubjectWeightService } from '@/services/SubjectWeightService';
import { TermClassService } from '@/services/TermClassService';
import { GradeSection, GradeSubject, SectionClass, StudentClass, StudentResult, SubjectWeight, TermClass } from '@/types/model';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
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
    const [termClasss, setTermClasss] = useState<TermClass[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const [selectedSectionClass, setSelectedSectionClass] = useState<SectionClass | null>(null);
    const [selectedTermClass, setSelectedTermClass] = useState<TermClass | null>(null);

    const [subjectWeights, setSubjectWeights] = useState<SubjectWeight[]>([]);
    const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
    const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
    const [resultEntries, setResultEntries] = useState<ResultEntry[]>([]);
    const queueStudentResults = useRef<StudentResult[]>([]);
    const [loading, setLoading] = useState(false);

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
            SectionClassService.getSectionClasssByGradeSection(selectedGradeSection).then((data) => {
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
            TermClassService.getTermClasssBySectionClass(selectedSectionClass).then((data) => {
                setTermClasss(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load term classes',
                    detail: '' + err,
                    life: 2000
                });
            });
            SubjectWeightService.getSubjectWeights(selectedSectionClass.grade_subject as GradeSubject).then((data) => {
                if (data.length === 0) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Failed to load subject weights',
                        detail: "Weights are not setted. Please set weights in the curriculum.",
                        life: 3000
                    });
                }
                setSubjectWeights(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load subject weights',
                    detail: '' + err,
                    life: 3000
                });
            });
        }

    }, [selectedSectionClass]);


    useEffect(() => {
        if (selectedTermClass) {
            StudentClassService.getStudentClasssByTermClass(selectedTermClass).then((data) => {
                if (data.length === 0) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Failed to load Student Classes',
                        detail: "No registred students for this class are found.",
                        life: 3000
                    });
                }
                setStudentClasses(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to load registred students',
                    detail: '' + err,
                    life: 3000
                });
            });

            StudentResultService.getStudentResultsByTermClass(selectedTermClass).then((data) => {
                setStudentResults(data);
                queueStudentResults.current.length = 0;
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to student results',
                    detail: '' + err,
                    life: 3000
                });
            });
        }

    }, [selectedTermClass]);

    useEffect(() => {
        if (studentClasses && subjectWeights && studentResults) {
            setResultEntries(prepareResultEntries);
        }
    }, [studentClasses, subjectWeights, studentResults]);

    const saveStudentResults = async () => {
        if (queueStudentResults.current.length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Nothing to update',
                detail: 'You havent update any results',
                life: 1500
            });
        }
        try {
            setLoading(true);
            const data = await StudentResultService.updateStudentResults(queueStudentResults.current);
            if (data.length === queueStudentResults.current.length) {

            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Results Setted',
                life: 1500
            });

            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to update results',
                detail: '' + error,
                life: 1500
            });
        }
    }
    //bad implementation
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
            status: 'ONGOING',
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

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Student Results</h5>
            <span className="block mt-2">
                <Button label='Save All' text loading={loading} onClick={saveStudentResults} />
            </span>
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
                                        optionLabel="grade_subject.subject.title"
                                        placeholder="Select Class"
                                    />
                                </div>
                            </div>
                            <div className="field col">
                                <label htmlFor="term">Term (Semester)</label>
                                <div id="term">
                                    <Dropdown
                                        value={selectedTermClass}
                                        onChange={(e) => setSelectedTermClass(e.value)}
                                        options={termClasss.map((item) => ({
                                            ...item,
                                            term: `Term ${item.term}`,
                                        }))}
                                        placeholder="Select Curriculum Term"
                                        optionLabel='term'
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
                            stripedRows
                            scrollable
                            editMode="cell"
                        >

                            {/*
                            <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }} frozen />
                            */}
                            <Column header="#" body={(rowData, options) => options.rowIndex + 1} style={{ width: '50px' }} />
                            <Column
                                //field='student_class.student_grade.student.first_name'
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
                                    editor={(options) =>
                                        <InputNumber value={options.value} onValueChange={(e) => {
                                            if (options.editorCallback) {
                                                options.editorCallback(e.value);
                                            }
                                        }}
                                            mode="decimal"
                                            maxFractionDigits={5}
                                            min={0}
                                            max={weight.assessment_weight}
                                            useGrouping={false}
                                        />}
                                    onCellEditComplete={onCellEditComplete}
                                />
                            ))}
                            <Column
                                header="Total"
                                body={(rowData) => calculateRowTotal(rowData)} // Function to calculate and display the total
                                style={{ fontWeight: 'bold', textAlign: 'right' }}
                            />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResultEntryPage;
