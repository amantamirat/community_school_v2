"use client"
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { SectionClassService } from '@/services/SectionClassService';
import { StudentClassService } from '@/services/StudentClassService';
import { StudentResultService } from '@/services/StudentResultService';
import { SubjectWeightService } from '@/services/SubjectWeightService';
import { GradeSection, SectionClass, StudentClass, StudentResult, SubjectWeight } from '@/types/model';
import { gradeSectionTemplate } from '@/types/templates';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';


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
    const [selectedSectionClass, setSelectedSectionClass] = useState<SectionClass | null>(null);
    const [subjectWeights, setSubjectWeights] = useState<SubjectWeight[]>([]);
    const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
    const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
    const [resultEntries, setResultEntries] = useState<ResultEntry[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [selectedTerm, setSelectedTerm] = useState(1);

    useEffect(() => {
        try {
            if (selectedClassificationGrade) {
                GradeSectionService.getGradeSectionsByClassificationGrade(selectedClassificationGrade).then((data) => {
                    setGradeSections(data);
                });
                setSelectedGradeSection(null);
            }
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load sections',
                detail: '' + err,
                life: 3000
            });
        }
    }, [selectedClassificationGrade]);

    useEffect(() => {
        try {
            if (selectedGradeSection) {
                SectionClassService.getSectionClasssByGradeSection(selectedGradeSection).then((data) => {
                    setSectionClasss(data);
                });
            } else {
                setSectionClasss([])
            }
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load section class',
                detail: '' + err,
                life: 3000
            });
        }
    }, [selectedGradeSection]);


    useEffect(() => {
        try {
            if (selectedSectionClass) {
                if (typeof selectedSectionClass.grade_subject === "object") {
                    SubjectWeightService.getSubjectWeights(selectedSectionClass.grade_subject).then((data) => {
                        setSubjectWeights(data);
                        const dynamicColumns = data.map((weight) => ({
                            header: `${weight.assessment_type} (${weight.assessment_weight}%)`, // Display assessment type with weight
                            field: weight.assessment_type, // Field for data mapping
                            editor: (options: any) =>
                                resultEditor({
                                    ...options,
                                    max: weight.assessment_weight, // Pass max value to the editor
                                }),
                        }));
                        setColumns(dynamicColumns);
                    });

                    StudentClassService.getStudentClasssBySectionClass(selectedSectionClass).then((data) => {
                        setStudentClasses(data);
                        //console.log(data);
                    });

                    StudentResultService.getStudentResultsBySectionClass(selectedTerm, selectedSectionClass).then((data) => {
                        setStudentResults(data);
                        //console.log(data);
                    });

                    setResultEntries(prepareResultEntries(studentClasses, subjectWeights, studentResults));
                }
            }
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load subject weights',
                detail: '' + err,
                life: 3000
            });
        }
    }, [selectedSectionClass]);

    const resultEditor = (options: any) => {
        const maxValue = options.max || 100;
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="decimal" min={0} max={maxValue} maxFractionDigits={5} useGrouping={false} className="p-inputnumber-sm block mb-2" />
    }

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



    // Prepare data for the DataTable
    const prepareResultEntries = (
        studentClasses: StudentClass[],
        subjectWeights: SubjectWeight[],
        studentResults: StudentResult[]
    ): ResultEntry[] => {
        return studentClasses.map(studentClass => {
            // Filter results for this student_class
            const resultsForStudent = studentResults.filter(
                result => result.student_class === studentClass._id
            );

            // Create an entry for this student_class
            const entry: ResultEntry = {
                student_class: studentClass,
            };

            // Map subject weights to their results
            subjectWeights.forEach(weight => {
                const result = resultsForStudent.find(
                    res => res.subject_weight === weight._id
                );
                entry[weight._id || "unknown_weight_id"] = result ? result.result : null;
            });

            return entry;
        });
    };




    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Student Results</h5>
            <span className="block mt-2">
                <Button label='Save All' text />
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
                                <label htmlFor="term">Term (Semester)</label>
                                <div id="term">
                                    <Dropdown
                                        value={selectedTerm}
                                        onChange={(e) => setSelectedTerm(e.value)}
                                        options={[1, 2]}
                                        placeholder="Select Curriculum Term"
                                    />
                                </div>
                            </div>
                            <div className="field col">
                                <label htmlFor="section">Section</label>
                                <div id="section">
                                    <Dropdown
                                        value={selectedGradeSection || null}
                                        onChange={(e) =>
                                            setSelectedGradeSection(e.value)
                                        }
                                        options={gradeSections}
                                        optionLabel="_id"
                                        placeholder="Select Section"
                                        itemTemplate={gradeSectionTemplate}
                                        valueTemplate={gradeSectionTemplate}
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
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <DataTable value={resultEntries} header={header} editMode="row">
                            <Column
                                //field='student_class.student_grade.student.first_name'
                                header="Student"
                                body={(rowData) => `${rowData.student_class.student_grade.student.first_name} ${rowData.student_class.student_grade.student.last_name}`}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
                            />
                            {columns.map((col, index) => (
                                <Column key={index} field={col.field} header={col.header} editor={col.editor} headerStyle={{ minWidth: '10rem' }} />
                            ))}
                            <Column
                                header="Total"
                                body={(rowData) => calculateRowTotal(rowData)} // Function to calculate and display the total
                                style={{ fontWeight: 'bold', textAlign: 'right' }}
                            />
                            <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResultEntryPage;
