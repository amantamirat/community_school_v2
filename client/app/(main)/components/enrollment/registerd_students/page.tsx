'use client';
import { AcademicSessionService } from '@/services/AcademicSessionService';
import { AdmissionClassificationService } from '@/services/AdmissionClassificationService';
import { ClassificationGradeService } from '@/services/ClassificationGradeService';
import { CurriculumService } from '@/services/CurriculumService';
import { ExternalStudentInfoService } from '@/services/ExternalStudentInfoService';
import { GradeService } from '@/services/GradeService';
import { StudentGradeService } from '@/services/StudentGradeService';
import { AcademicSession, AdmissionClassification, ClassificationGrade, Curriculum, ExternalStudentInfo, Grade, StudentGrade } from '@/types/model';
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
interface RegisteredStudentsProps {
    classification_grade: ClassificationGrade;
}
const RegisteredStudentsComponent = (props: RegisteredStudentsProps) => {
    const toast = useRef<Toast>(null);
    const [selectedRegisteredStudents, setSelectedRegisteredStudents] = useState<StudentGrade[]>([]);
    const [registeredStudents, setRegisteredStudents] = useState<StudentGrade[]>([]);
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

    const loadRegisteredStudents = async () => {
        try {
            if (props.classification_grade) {
                setLoading(true);
                const data = await StudentGradeService.getRegisteredStudents(props.classification_grade);
                console.log(data);
                setRegisteredStudents(data);
                setLoading(false);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed Load Registred Students',
                detail: '' + error,
                life: 3000
            });
        }
    };

    const deregisterStudents = async () => {
        try {
            await StudentGradeService.deRegisterStudents(props.classification_grade, selectedRegisteredStudents);
            setRegisteredStudents((prevRegStudents) =>
                prevRegStudents.filter(
                    (student) => !selectedRegisteredStudents.some((selected) => selected._id === student._id)
                )
            );
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `${selectedRegisteredStudents.length} students unenrolled`,
                life: 3000
            });
            setSelectedRegisteredStudents([]);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to deregister Students',
                detail: '' + error,
                life: 3000
            });
        }
    }

    const startToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Display Registred Students" icon={PrimeIcons.EYE} severity="info" loading={loading} className="mr-2" onClick={loadRegisteredStudents} />
                </div>
            </>
        );
    };

    const endToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Deregister Selected Students" icon={PrimeIcons.STOP_CIRCLE} severity="danger" className="mr-2" disabled={selectedRegisteredStudents.length == 0} onClick={deregisterStudents} />
                </div>
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Registred Students</h5>
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
                            value={registeredStudents}
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
                            selection={selectedRegisteredStudents}
                            globalFilter={globalFilter}
                            filters={filters}
                            onSelectionChange={(e) => setSelectedRegisteredStudents(e.value as any)}>
                            <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                            <Column
                                header="#"
                                body={(rowData, options) => options.rowIndex + 1}
                                style={{ width: '50px' }}
                            />
                            <Column field="student.first_name" header="First Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="student.last_name" header="Last Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="student.sex" header="Sex" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="student.birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="status" header="Status" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        </DataTable>
                    </>
                </div>
            </div>
        </div>
    );
};

export default RegisteredStudentsComponent;
