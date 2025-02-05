'use client';
import { TermClassService } from "@/services/TermClassService";
import { SectionClass, SectionSubject, TermClass } from "@/types/model";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";

interface TermClassProps {
    sectionSubject: SectionSubject;
}
const TermClassComponent = (props: TermClassProps) => {

    let emptyTermClass: TermClass = {
        section_subject: props.sectionSubject,
        subject_term: '',
        status: 'ACTIVE'
    };

    const [selectedTermClass, setSelectedTermClass] = useState<TermClass>(emptyTermClass);
    const [termClasses, setTermClasses] = useState<TermClass[]>([]);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        TermClassService.getTermClassesBySubject(props.sectionSubject).then((data) => {
            setTermClasses(data);
        }).catch((err) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load term classes',
                detail: '' + err,
                life: 3000
            });
        }).finally();
    }, []);



    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h6 className="m-0">Terms</h6>
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
                        value={termClasses}
                        selection={selectedTermClass}
                        onSelectionChange={(e) => setSelectedTermClass(e.value)}
                        dataKey="_id"
                        emptyMessage={`No terms for ${props.sectionSubject?._id} class found.`}
                        rows={5}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column field="subject_term.term" header="Term" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default TermClassComponent;