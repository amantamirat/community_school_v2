"use client"
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { GradeSectionService } from '@/services/GradeSectionService';
import { SectionClassService } from '@/services/SectionClassService';
import { SubjectWeightService } from '@/services/SubjectWeightService';
import { GradeSection, SectionClass, SubjectWeight } from '@/types/model';
import { gradeSectionTemplate } from '@/types/templates';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
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
    const [columns, setColumns] = useState<any[]>([]);

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
                    //console.log(data);
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
                        //console.log(data);
                        const dynamicColumns = data.map((weight) => ({
                            field: weight.assessment_type,
                            header: weight.assessment_type,
                        }));
                        setColumns(dynamicColumns);
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
                        <h5>Empty Page</h5>
                        <p>subject weight {subjectWeights.length}</p>
                        <DataTable value={tableData}>
                            {columns.map((col, index) => (
                                <Column key={index} field={col.field} header={col.header} />
                            ))}
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResultEntryPage;
