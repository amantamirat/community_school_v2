'use client';
import { ExternalStudentInfoService } from '@/services/ExternalStudentInfoService';
import { GradeService } from '@/services/GradeService';
import { StudentGradeService } from '@/services/StudentGradeService';
import { StudentService } from '@/services/StudentService';
import { AcademicSession, AdmissionClassification, ClassificationGrade, Curriculum, ExternalStudentInfo, Grade, Student, StudentGrade } from '@/types/model';
import { FilterMatchMode, PrimeIcons } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
interface NewStudentsProps {
    classification_grade: ClassificationGrade;
}
const NewStudentsComponent = (props: NewStudentsProps) => {
    const toast = useRef<Toast>(null);
    const [selectedElligibleStudents, setSelectedElligibleStudents] = useState<Student[]>([]);
    const [elligibleStudents, setElligibleStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});

    useEffect(() => {
        initFilters();
    }, []);


    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        });
        setGlobalFilter('');
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        (_filters['global'] as any).value = value;
        setFilters(_filters);
        setGlobalFilter(value);
    };

    const loadElligbleStudents = async () => {
        try {
            if (props.classification_grade) {
                setLoading(true);
                const data = await StudentService.getNewStudents();
                setElligibleStudents(data);
                setLoading(false);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed Load Elligible Students',
                detail: '' + error,
                life: 3000
            });
        }
    };

    const enrollNewElligibleStudents = async () => {
        try {
            const registered_student_ids = [];
            
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `${registered_student_ids.length} new students enrolled`,
                life: 3000
            });
            //console.log(data);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed Enrol New Students',
                detail: '' + error,
                life: 3000
            });
        }
    }

    const startToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Display Elligible Students" icon={PrimeIcons.EYE} severity="info" loading={loading} className="mr-2" onClick={loadElligbleStudents} />
                </div>
            </>
        );
    };

    const endToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Enrol Selected Students" icon={PrimeIcons.CHECK_CIRCLE} severity="success" className="mr-2" disabled={selectedElligibleStudents.length == 0} onClick={enrollNewElligibleStudents} />
                </div>
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">New (Level-1) Students</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
            </span>
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <>
                        <Toolbar className="mb-4" start={startToolbarTemplate} end={endToolbarTemplate} />
                        <DataTable
                            header={header}
                            value={elligibleStudents}
                            dataKey="_id"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                            emptyMessage="No students found."
                            scrollable
                            selectionMode="multiple"
                            selection={selectedElligibleStudents}
                            globalFilter={globalFilter}
                            filters={filters}
                            onSelectionChange={(e) => setSelectedElligibleStudents(e.value as any)}>
                            <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                            <Column
                                header="#"
                                body={(rowData, options) => options.rowIndex + 1}
                                style={{ width: '50px' }}
                            />
                            <Column field="first_name" header="First Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="last_name" header="Last Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="sex" header="Sex" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        </DataTable>
                    </>
                </div>
            </div>
        </div>
    );
};

export default NewStudentsComponent;
