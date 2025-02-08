'use client';
import { useClassificationGrade } from "@/app/(main)/contexts/classificationGradeContext";
import { ClassificationGradeService } from "@/services/ClassificationGradeService";
import { GradeSectionService } from "@/services/GradeSectionService";
import { ClassificationGrade, GradeSection } from "@/types/model";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
interface GradeSectionProps {
    classificationGrade: ClassificationGrade;
    onUpdate: (updatedGrade: ClassificationGrade) => void;
}
const GradeSectionComponent = (props: GradeSectionProps) => {


    const [gradeSections, setGradeSections] = useState<GradeSection[]>([]);
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GradeSectionService.getGradeSectionsByClassificationGrade(props.classificationGrade).then((data) => {
            setGradeSections(data);
        }).catch((err) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load sections',
                detail: '' + err,
                life: 3000
            });
        });
    }, []);


    const closeClassificationGrade = async () => {
        try {

            if (props.classificationGrade.status === 'CLOSED') {
                throw new Error('Grade Already Closed');
            }
            setLoading(true);
            if (gradeSections.length === 0) {
                throw new Error('Cannot close grade, No Sections Found.');
            }
            const hasOpenSection = gradeSections.some(sec => sec.status === 'OPEN');
            if (hasOpenSection) {
                throw new Error('Cannot close grade, open sections exist.');
            }
            const closedSection = await ClassificationGradeService.closeGrade(props.classificationGrade);
                if (closedSection.status === 'CLOSED') {
                    props.onUpdate({...props.classificationGrade, status:'CLOSED'});
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Grade Closed',
                        life: 1500
                    });
                }

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to close grade',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
    }


    const openClassificationGrade = async () => {
        try {
            if (props.classificationGrade) {
                if (props.classificationGrade.status === 'OPEN') {
                    throw new Error('Grade Already Opened');
                }
                setLoading(true);
                const openedGrade = await ClassificationGradeService.openGrade(props.classificationGrade);
                if (openedGrade.status === 'OPEN') {
                    props.onUpdate({...props.classificationGrade, status:'OPEN'});
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Grade Backed to Opened!',
                        life: 1500
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to open grade',
                detail: '' + error,
                life: 1500
            });
        } finally {
            setLoading(false);
        }
    }

    const getSeverity = (value: GradeSection) => {
        switch (value.status) {
            case 'OPEN':
                return 'success';

            case 'CLOSED':
                return 'info';

            default:
                return null;
        }
    };

    const statusBodyTemplate = (rowData: GradeSection) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData)}></Tag>;
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <span className="block mt-2">
                {props.classificationGrade?.status === 'OPEN' ?
                    <Button label='Close Grade' severity='info' icon="pi pi-lock" onClick={closeClassificationGrade} loading={loading} />
                    : <Button label='Open Grade' severity='success' icon="pi pi-lock-open" onClick={openClassificationGrade}  loading={loading} />
                }
            </span>
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <DataTable
                        header={header}
                        value={gradeSections}
                        dataKey="_id"
                        emptyMessage={`No section data found.`}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sections"
                    >
                        <Column field="section_number" header="Section" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default GradeSectionComponent;