'use client';
import { SectionSubjectService } from "@/services/SectionSubjectService";
import { GradeSection, SectionSubject } from "@/types/model";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import TermClassComponent from "../term_classes/page";
import { Button } from "primereact/button";
import { GradeSectionService } from "@/services/GradeSectionService";

interface SectionClassProps {
    gradeSection: GradeSection;
    onUpdate: (updatedSection: GradeSection) => void;
}
const SectionClassComponent = (props: SectionClassProps) => {

    let emptySectionSubject: SectionSubject = {
        grade_section: '',
        grade_subject: '',
        teacher: '',
        status: 'ACTIVE'
    };

    const [selectedSectionSubject, setSelectedSectionSubject] = useState<SectionSubject>(emptySectionSubject);
    const [sectionSubjects, setSectionSubjects] = useState<SectionSubject[]>([]);
    const toast = useRef<Toast>(null);
    const [expandedClassRows, setExpandedClassRows] = useState<any[] | DataTableExpandedRows>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        SectionSubjectService.getSectionClasssByGradeSection(props.gradeSection).then((data) => {
            setSectionSubjects(data);
        }).catch((err) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load section class',
                detail: '' + err,
                life: 3000
            });
        }).finally();
    }, []);


    const closeGradeSection = async () => {
        try {
            if (props.gradeSection) {
                if (props.gradeSection.status === 'CLOSED') {
                    throw new Error('Section Already Closed');
                }
                setLoading(true);
                if(sectionSubjects.length===0){
                    throw new Error('Cannot close section, No Subjects Found.');
                }
                const hasActiveSubject = sectionSubjects.some(subject => subject.status === 'ACTIVE');
                if (hasActiveSubject) {
                    throw new Error('Cannot close section, active class exist');
                }
                const closedSection = await GradeSectionService.closeGradeSection(props.gradeSection);
                if (closedSection.status === 'CLOSED') {
                    props.onUpdate(closedSection);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Section Closed',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to close section',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
    }

    const openGradeSection = async () => {
        try {
            if (props.gradeSection) {
                if (props.gradeSection.status === 'OPEN') {
                    throw new Error('Section Already Opened');
                }
                setLoading(true);
                const openedSection = await GradeSectionService.openGradeSection(props.gradeSection);
                if (openedSection.status === 'OPEN') {
                    props.onUpdate(openedSection);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Section Opened!',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to open section',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h6 className="m-0">Section Classes</h6>
            <span className="block mt-2">
                {props.gradeSection.status === 'OPEN' ?
                    <Button label='Close Section' severity='info' icon="pi pi-lock" onClick={closeGradeSection} loading={loading} />
                    : <Button label='Open Section' severity='success' icon="pi pi-lock-open" onClick={openGradeSection} loading={loading} />
                }
            </span>
        </div>
    );

    const getSeverity = (value: string) => {
        switch (value) {
            case 'ACTIVE':
                return 'warning';
            case 'SUBMITTED':
                return 'info';
            case 'PENDING':
                return 'danger';
            case 'APPROVED':
                return 'success';
            default:
                return null;
        }
    };

    const statusBodyTemplate = (rowData: SectionSubject) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)}></Tag>;
    };



    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <DataTable
                        header={header}
                        value={sectionSubjects}
                        selection={selectedSectionSubject}
                        onSelectionChange={(e) => setSelectedSectionSubject(e.value)}
                        dataKey="_id"
                        emptyMessage={`No class for ${props.gradeSection?.section_number} section found.`}
                        paginator
                        rows={15}
                        expandedRows={expandedClassRows}
                        onRowToggle={(e) => setExpandedClassRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <TermClassComponent
                                sectionSubject={data as SectionSubject}
                            />
                        )}
                    >
                        <Column expander style={{ width: '4em' }} />
                        <Column field="grade_subject.subject.title" header="Subject" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column header="Teacher" field="teacher.first_name" body={(rowData) =>
                            rowData.teacher
                                ? `${rowData.teacher.sex === 'Male' ? 'Mr.' : 'Miss'} ${rowData.teacher.first_name} ${rowData.teacher.last_name}`
                                : 'N/A'
                        } sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default SectionClassComponent;