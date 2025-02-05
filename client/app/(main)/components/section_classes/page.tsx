'use client';
import { SectionSubjectService } from "@/services/SectionSubjectService";
import { GradeSection, SectionClass, SectionSubject } from "@/types/model";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import TermClassComponent from "../term_classes/page";

interface SectionClassProps {
    gradeSection: GradeSection;
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



    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h6 className="m-0">Section Classes</h6>
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

    const statusBodyTemplate = (rowData: SectionClass) => {
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