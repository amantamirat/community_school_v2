"use client"
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { SectionClassService } from '@/services/SectionClassService';
import { StudentClassService } from '@/services/StudentClassService';
import { SubjectWeightService } from '@/services/SubjectWeightService';
import { GradeSection, SectionClass, StudentClass, SubjectWeight } from '@/types/model';
import { gradeSectionTemplate } from '@/types/templates';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

const ResultEntryPage = () => {
    const toast = useRef<Toast>(null);
    const { selectedClassificationGrade } = useClassificationGrade();
    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const [sectionClasss, setSectionClasss] = useState<SectionClass[]>([]);
    const [selectedGradeSection, setSelectedGradeSection] = useState<GradeSection | null>(null);
    const [selectedSectionClass, setSelectedSectionClass] = useState<SectionClass | null>(null);
    const [subjectWeights, setSubjectWeights] = useState<SubjectWeight[]>([]);
    const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [term, setTerm] = useState(1);

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
                        console.log(data);
                    });
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

    const calculateRowTotal = (rowData: any) => {
        return Object.keys(rowData)
            .filter((key) => key !== '_id' && key !== 'total') // Exclude non-assessment keys
            .reduce((sum, key) => sum + (rowData[key] || 0), 0); // Sum up all assessment weights
    };



    // Prepare data for the DataTable
    const tableData = subjectWeights.map((weight) => ({
        ...weight,
        [weight.assessment_type]: weight.assessment_weight,
    }));

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
                                        value={term}
                                        onChange={(e) => setTerm(e.value)}
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
                        <DataTable value={studentClasses}>
                            <Column
                                header="Student"
                                body={(rowData) => `${rowData.student_grade.student.first_name} ${rowData.student_grade.student.last_name}`}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
                            />                            
                            {columns.map((col, index) => (
                                <Column key={index} field={col.field} header={col.header} editor={col.editor} />
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
