'use client';
import { useClassificationGrade } from '@/app/(main)/contexts/classificationGradeContext';
import { ExternalStudentInfoService } from '@/services/ExternalStudentInfoService';
import { ExternalStudentInfo} from '@/types/model';
import { FilterMatchMode, PrimeIcons } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';


const NewExternalStudentsComponent = () => {
    const toast = useRef<Toast>(null);
    const { selectedClassificationGrade } = useClassificationGrade();
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

    useEffect(() => {
        if (selectedClassificationGrade) {
            ExternalStudentInfoService.getExternalElligibleStudentsByGrade(selectedClassificationGrade).then((data) => {
                setElligibleStudents(data);
            }).catch((err) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed Load Elligible Students',
                    detail: '' + err,
                    life: 3000
                });
            }).finally(() => { setLoading(false) });
        }
    }, [selectedClassificationGrade]);

    const enrollExternalElligibleStudents = async () => {
        try {
            setLoading(true);
            if (selectedClassificationGrade) {
                const registered_student_ids = await ExternalStudentInfoService.registerExternalStudents(selectedClassificationGrade, selectedElligibleStudents);
                if (registered_student_ids.length > 0) {
                    setElligibleStudents((prevElligibleStudents) =>
                        prevElligibleStudents.filter(student => !registered_student_ids.includes(student._id)));
                    setSelectedElligibleStudents((prevSelectedStudents) =>
                        prevSelectedStudents.filter(student => !registered_student_ids.includes(student._id)));

                }
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: `${registered_student_ids.length} students enrolled`,
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Failed Enrol New Students',
                detail: '' + error,
                life: 3000
            });
        }
        finally {
            setLoading(false);
        }
    }

    const startToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Enrol Selected Students" icon={PrimeIcons.CHECK_CIRCLE} severity="success" className="mr-2" disabled={selectedElligibleStudents.length == 0} onClick={enrollExternalElligibleStudents} loading={loading} />
                </div>
            </>
        );
    };

    const endToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                </div>
            </>
        );
    };

    const getSeverity = (value: ExternalStudentInfo) => {
        switch (value.status) {
            case 'PROMOTED':
                return 'success';
            case 'FAILED':
                return 'danger';

            default:
                return null;
        }
    };

    const statusBodyTemplate = (rowData: ExternalStudentInfo) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData)}></Tag>;
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
                        <Column field="student.first_name" header="Student" body={(rowData) => `${rowData.student.first_name} ${rowData.student.last_name}`} sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="student.sex" header="Sex" sortable headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="student.birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '10rem' }}
                            body={(rowData) => new Date(rowData.student.birth_date).toLocaleDateString('en-GB')} />
                        <Column field="academic_year" header="Year" sortable headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="grade.level" header="Grade"
                            body={(rowData) => `${rowData.grade.stage}-${rowData.grade.level} ${rowData.grade.specialization ? `(${rowData.grade.specialization})` : ''}`}
                            sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="classification" header="Admission" sortable headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '5rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default NewExternalStudentsComponent;
