'use client';
import { SectionClassService } from "@/services/SectionClassService";
import { GradeSection, GradeSubject, SectionClass, SubjectTerm } from "@/types/model";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";

interface SectionClassProps {
    gradeSection: GradeSection;
}
const SectionClassComponent = (props: SectionClassProps) => {

    let emptySectionClass: SectionClass = {
        grade_section: props.gradeSection,
        subject_term: '',
        status: 'PENDING'
    };

    const [sectionClasss, setSectionClasss] = useState<SectionClass[]>([]);
    const [selectedSectionClass, setSelectedSectionClass] = useState<SectionClass>(emptySectionClass);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        SectionClassService.getSectionClasssByGradeSection(props.gradeSection).then((data) => {
            setSectionClasss(data);
        }).catch((err) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load section class',
                detail: '' + err,
                life: 3000
            });
        }).finally();
    }, []);



    const deleteSectionClass = async () => {
        try {
            if (selectedSectionClass._id) {
                const deleted = await SectionClassService.deleteSectionClass(selectedSectionClass._id);
                if (deleted) {
                    let _sectionClasss = (sectionClasss as any)?.filter((val: any) => val._id !== selectedSectionClass._id);
                    setSectionClasss(_sectionClasss);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Class Deleted',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to remove class',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setShowRemoveDialog(false);
            setSelectedSectionClass(emptySectionClass);
        }

    }



    const confirmRemoveSectionClass = (sectionClass: SectionClass) => {
        setSelectedSectionClass(sectionClass);
        setShowRemoveDialog(true);
    };

    const hideRemoveDialog = () => {
        setShowRemoveDialog(false);
    };

    const removeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideRemoveDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteSectionClass} />
        </>
    );


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h6 className="m-0">Manage Section Classes</h6>
        </div>
    );

    const teacherBodyTemplate = (rowData: SectionClass) => {
        return (<>
            {typeof rowData.teacher === 'string' ? (
                rowData.teacher || 'N/A'
            ) : rowData.teacher && typeof rowData.teacher === 'object' ? (
                rowData.teacher.first_name + " " + rowData.teacher.last_name || 'N/A'
            ) : (
                'N/A'
            )}
        </>);
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (sectionClasss as any)?.length; i++) {
            if ((sectionClasss as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

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

    const actionBodyTemplate = (rowData: SectionClass) => {
        return (
            <>
                {!(((rowData.subject_term) as SubjectTerm).grade_subject as GradeSubject).optional
                    && <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmRemoveSectionClass(rowData)} />
                }
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <DataTable
                        header={header}
                        value={sectionClasss}
                        selection={selectedSectionClass}
                        onSelectionChange={(e) => setSelectedSectionClass(e.value)}
                        dataKey="_id"
                        emptyMessage={`No class for section ${props.gradeSection.section_number} found.`}
                        paginator
                        rows={15}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="subject_term.grade_subject.subject.title" header="Subject" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="subject_term.term" header="Term" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="teacher.first_name" header="Teacher" body={(rowData) => rowData.teacher ? `${rowData.teacher.first_name} ${rowData.teacher.last_name}` : 'N/A'} sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showRemoveDialog}
                        style={{ width: '450px' }}
                        header="Confirm to Delete Class"
                        modal
                        footer={removeDialogFooter}
                        onHide={hideRemoveDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedSectionClass && (
                                <span>
                                    Are you sure you want to delete <b>{selectedSectionClass._id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default SectionClassComponent;