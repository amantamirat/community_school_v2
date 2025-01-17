'use client';
import { ExternalStudentInfoService } from '@/services/ExternalStudentInfoService';
import { StudentGradeService } from '@/services/StudentGradeService';
import { ClassificationGrade, ExternalStudentInfo, StudentGrade } from '@/types/model';
import { FilterMatchMode, PrimeIcons } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';

interface NewExternalStudentsProps {
    classification_grade: ClassificationGrade;
}
const NewExternalStudentsComponent = (props: NewExternalStudentsProps) => {
    const toast = useRef<Toast>(null);
    const [selectedElligibleStudents, setSelectedElligibleStudents] = useState<ExternalStudentInfo[]>([]);
    const [elligibleStudents, setElligibleStudents] = useState<ExternalStudentInfo[]>([]);
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
                const data = await ExternalStudentInfoService.getExternalElligibleStudentsByGrade(props.classification_grade);
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

    const enrollExternalElligibleStudents = async () => {
        try {
            const registered_students: StudentGrade[] = await StudentGradeService.registerExternalStudents(props.classification_grade, selectedElligibleStudents);
            const registered_student_ids = registered_students.map(registered =>
                typeof registered.student === 'string' ? registered.student : registered.student._id
            );
            setElligibleStudents((prevElligibleStudents) =>
                prevElligibleStudents.filter(student => {
                    if (typeof student.student === 'string') {
                        return !registered_student_ids.includes(student.student);
                    }
                    return !registered_student_ids.includes(student.student._id);
                })
            );
            setSelectedElligibleStudents((prevElligibleStudents) =>
                prevElligibleStudents.filter(student => {
                    if (typeof student.student === 'string') {
                        return !registered_student_ids.includes(student.student);
                    }
                    return !registered_student_ids.includes(student.student._id);
                })
            );
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `${registered_student_ids.length} students enrolled`,
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
                    <Button label="Enrol Selected Students" icon={PrimeIcons.CHECK_CIRCLE} severity="success" className="mr-2" disabled={selectedElligibleStudents.length == 0} onClick={enrollExternalElligibleStudents} />
                </div>
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">External (NEW) Students</h5>
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
                            <Column field="student.first_name" header="First Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="student.last_name" header="Last Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="student.sex" header="Sex" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="student.birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="grade.stage" header="Grade stage" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="grade.level" header="Grade level" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="academic_year" header="Academic Year" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="status" header="Status" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        </DataTable>
                    </>
                </div>
            </div>
        </div>
    );
};

export default NewExternalStudentsComponent;
