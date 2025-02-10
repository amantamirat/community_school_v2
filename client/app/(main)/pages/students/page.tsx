'use client';
import { GradeService } from '@/services/GradeService';
import { StudentService } from '@/services/StudentService';
import { ExternalStudentInfo, Grade, Student } from '@/types/model';
import { gradeTemplate } from '@/types/templates';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Steps } from 'primereact/steps';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import ExternalInfoComponent from '../../components/external_student_info/page';
import { Avatar } from 'primereact/avatar';
import { MyService } from '@/services/MyService';

const StudentPage = () => {
    let emptyStudent: Student = {
        first_name: '',
        middle_name: '',
        last_name: '',
        sex: 'Male',
        birth_date: null,
        has_perior_school_info: true,
    };
    let emptyExternalInfo: ExternalStudentInfo = {
        student: '',
        school_name: '',
        academic_year: 1990,
        classification: "REGULAR",
        grade: '',
        average_result: 0,
        status: 'INCOMPLETE',
        transfer_reason: ''
    };
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student>(emptyStudent);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});

    const [activeIndex, setActiveIndex] = useState(0);
    const steps = [
        { label: 'Basic Information' },
        { label: 'Last Recent School Info' },
        { label: 'Confirmation' },
    ];
    const [selectedExternalInfo, setSelectedExternalInfo] = useState<ExternalStudentInfo>(emptyExternalInfo);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [expandedClassRows, setExpandedClassRows] = useState<any[] | DataTableExpandedRows>([]);

    useEffect(() => {
        initFilters();
        loadStudents();
        loadGrades();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await StudentService.getStudents();
            setStudents(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load students:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load students',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const loadGrades = async () => {
        try {
            const data = await GradeService.getGrades();
            setGrades(data);
        } catch (err) {
            //console.error('Failed to load grades:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

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

    const validateStudent = (student: Student) => {
        if (student.first_name.trim() === '' ||
            student.middle_name.trim() === '' ||
            student.last_name.trim() === '' ||
            !student.birth_date
        ) {
            return false;
        }
        return true; // All required fields are provided
    };

    const validateExternalInfo = (externalInfo: ExternalStudentInfo) => {
        if (externalInfo.school_name.trim() === '' ||
            externalInfo.status.trim() === '' ||
            externalInfo.classification.trim() === '' ||
            isNaN(externalInfo.academic_year) ||
            isNaN(externalInfo.average_result)
        ) {
            return false;
        }
        return true; // All required fields are provided
    };

    const saveStudent = async () => {
        setSubmitted(true);
        let _students = [...(students as any)];
        if (!validateStudent(selectedStudent)) {
            return;
        }
        try {
            if (selectedStudent._id) {
                let id = selectedStudent._id;
                const updatedStudent = await StudentService.updateStudent(selectedStudent);
                const index = findIndexById(id);
                _students[index] = updatedStudent;
            } else {
                if (selectedStudent.has_perior_school_info && !validateExternalInfo(selectedExternalInfo)) {
                    return;
                }
                const newStudent = await StudentService.createStudent(selectedStudent, selectedStudent.has_perior_school_info ? selectedExternalInfo : null);
                if (newStudent) {
                    _students.push(newStudent);
                }

            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `Student ${selectedStudent._id ? 'Updated' : 'Created'}`,
                life: 3000
            });

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: `Failed to ${selectedStudent._id ? 'update' : 'create'} Student`,
                detail: '' + error,
                life: 3000
            });
        } finally {
            setShowSaveDialog(false);
            setShowEditDialog(false);
            setSelectedStudent(emptyStudent);
            setSelectedExternalInfo(emptyExternalInfo);
            setStudents(_students);
        }
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (students as any)?.length; i++) {
            if ((students as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const deleteStudent = async () => {
        try {
            const deleted = await StudentService.deleteStudent(selectedStudent._id || "");
            if (deleted) {
                let _students = (students as any)?.filter((val: any) => val._id !== selectedStudent._id);
                setStudents(_students);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Student Deleted',
                    life: 3000
                });
            }
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete student',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedStudent(emptyStudent);
    };

    const openSaveDialog = () => {
        setSelectedStudent(emptyStudent);
        setSelectedExternalInfo(emptyExternalInfo);
        setActiveIndex(0);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = async (student: Student) => {
        setSelectedStudent({ ...student });
        setActiveIndex(0);
        setSubmitted(false);
        setShowEditDialog(true);
    };

    const hideSaveDialog = () => {
        setShowSaveDialog(false);
        setShowEditDialog(false);
        setSubmitted(false);
    };

    const saveDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" onClick={hideSaveDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveStudent} />
        </>
    );

    const stepFooter = () => {
        return <><div className="dialog-footer" style={{ marginTop: '2rem', textAlign: 'right' }}>
            <Button
                label="Previous"
                icon="pi pi-arrow-left"
                onClick={handlePrevious}
                disabled={activeIndex === 0}
                className="p-button-secondary"
                style={{ marginRight: '0.5rem' }}
            />
            {activeIndex < steps.length - 1 && (
                <Button
                    label="Next"
                    icon="pi pi-arrow-right"
                    onClick={handleNext}
                    className="p-button-primary"
                />
            )}
            {activeIndex === steps.length - 1 && (
                <Button
                    label="Finish"
                    icon="pi pi-check"
                    onClick={saveStudent}
                    className="p-button-success"
                />
            )}
        </div></>
    };

    const handleNext = () => {
        if (activeIndex < steps.length - 1) {
            if (activeIndex === 0) {
                setSubmitted(true);
                if (!validateStudent(selectedStudent)) {
                    return;
                }
                if (!selectedStudent.has_perior_school_info) {
                    setActiveIndex(2);//go to step 3
                    return
                }
            }
            else if (activeIndex === 1) {
                setSubmitted(true);
                if (!validateExternalInfo(selectedExternalInfo)) {
                    return;
                }

            }
            setSubmitted(false);
            setActiveIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (activeIndex > 0) {
            if (activeIndex === 2) {
                if (!selectedStudent.has_perior_school_info) {
                    setActiveIndex(1);//go to step 1
                    return
                }
            }
            setActiveIndex((prevIndex) => prevIndex - 1);
        }
    };

    const renderStudentFormContent = () => (
        <>
            <div className="field grid">
                <label htmlFor="first_name" className='col-2 mb-0'>First Name</label>
                <div id="first_name" className="col-10">
                    <InputText
                        value={selectedStudent.first_name}
                        onChange={(e) => setSelectedStudent({ ...selectedStudent, first_name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({
                            'p-invalid': submitted && !selectedStudent.first_name,
                        })}
                    />
                    {submitted && !selectedStudent.first_name && <small className="p-invalid">First Name is required.</small>}
                </div>
            </div>
            <div className="field grid">
                <label htmlFor="middle_name" className="col-2 md:mb-0">Middle Name</label>
                <div className="col-10">
                    <InputText
                        id="middle_name"
                        value={selectedStudent.middle_name}
                        onChange={(e) => setSelectedStudent({ ...selectedStudent, middle_name: e.target.value })}
                        required
                        className={classNames({
                            'p-invalid': submitted && !selectedStudent.middle_name,
                        })}
                    />
                    {submitted && !selectedStudent.middle_name && <small className="p-invalid">Middle Name is required.</small>}
                </div>
            </div>
            <div className="field grid">
                <label htmlFor="last_name" className="col-2 md:mb-0">Last Name</label>
                <div className="col-10">
                    <InputText
                        id="last_name"
                        value={selectedStudent.last_name}
                        onChange={(e) => setSelectedStudent({ ...selectedStudent, last_name: e.target.value })}
                        required
                        className={classNames({
                            'p-invalid': submitted && !selectedStudent.last_name,
                        })}
                    />
                    {submitted && !selectedStudent.last_name && <small className="p-invalid">Last Name is required.</small>}
                </div>
            </div>

            <div className="field grid">
                <label className="col-2">Gender</label>
                <div className="col-10 flex align-items-center">
                    <div className="col-5">
                        <RadioButton inputId="sex1" name="sex" value="Male" onChange={(e) => setSelectedStudent({ ...selectedStudent, sex: "Male" })} checked={selectedStudent.sex === 'Male'} />
                        <label htmlFor="sex1">Male</label>
                    </div>
                    <div className="col-5" style={{ marginLeft: "20px" }}>
                        <RadioButton inputId="sex2" name="sex" value="Female" onChange={(e) => setSelectedStudent({ ...selectedStudent, sex: "Female" })} checked={selectedStudent.sex === 'Female'} />
                        <label htmlFor="sex2">Female</label>
                    </div>
                </div>
            </div>
            <div className="field grid">
                <label htmlFor="birth_date" className="col-2 md:mb-0">Birth Date</label>
                <div className="col-10">
                    <Calendar id="birth_date"
                        value={selectedStudent.birth_date ? new Date(selectedStudent.birth_date) : null}
                        onChange={(e) => setSelectedStudent({ ...selectedStudent, birth_date: e.value || null })}
                        showIcon required
                        className={classNames({
                            'p-invalid': submitted && !selectedStudent.birth_date,
                        })}
                    />
                    {submitted && !selectedStudent.birth_date && <small className="p-invalid">Birth Date is required.</small>}
                </div>
            </div>
            {selectedStudent._id ? <></> :
                <>
                    <div className="field grid">
                        <label htmlFor="has_perior_school_info" className="col-6 mb-0">Has Perior School Info</label>
                        <div className="col-6">
                            <Checkbox
                                inputId="has_perior_school_info"
                                checked={selectedStudent.has_perior_school_info}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, has_perior_school_info: e.checked! })}
                            />
                        </div>
                    </div>
                </>
            }
        </>
    );

    const renderExternalInfoFormContent = () => (
        <>
            {selectedStudent.has_perior_school_info ? (
                <div className="form">
                    {/* School Name */}
                    <div className="field grid">
                        <label htmlFor="school_name" className="col-2 mb-0">School Name</label>
                        <div className="col-10">
                            <InputText
                                id="school_name"
                                value={selectedExternalInfo.school_name}
                                onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, school_name: e.target.value })}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !selectedExternalInfo.school_name,
                                })}
                            />
                            {submitted && !selectedExternalInfo.school_name && <small className="p-invalid">School Name is required.</small>}
                        </div>
                    </div>
                    <div className="field grid">
                        {/* Academic Year */}
                        <div className="col-6">
                            <div className="field grid">
                                <label htmlFor="academic_year" className="col-4 mb-0">Academic Year</label>
                                <div className="col-8">
                                    <InputNumber
                                        id="academic_year"
                                        value={selectedExternalInfo.academic_year}
                                        onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, academic_year: e.value || 1990 })}
                                        mode="decimal" // Basic number mode
                                        useGrouping={false} // No thousand separator
                                        required
                                        className={classNames({
                                            'p-invalid': submitted && !selectedExternalInfo.academic_year,
                                        })}
                                    />
                                    {submitted && !selectedExternalInfo.academic_year && <small className="p-invalid">Academic Year is required.</small>}
                                </div>
                            </div>
                        </div>
                        {/* Classification */}
                        <div className="col-6">
                            <div className="field grid">
                                <label htmlFor="classification" className="col-4 mb-0">Classification</label>
                                <div className="col-8">
                                    <Dropdown
                                        id="classification"
                                        value={selectedExternalInfo.classification}
                                        options={[{ label: 'Regular', value: 'REGULAR' }, { label: 'Evening', value: 'EVENING' }, { label: 'Distance', value: 'DISTANCE' }]}
                                        onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, classification: e.value })}
                                        required
                                        placeholder="Select Classification"
                                        className={classNames({
                                            'p-invalid': submitted && !selectedExternalInfo.classification,
                                        })}
                                    />
                                    {submitted && !selectedExternalInfo.classification && <small className="p-invalid">Classification is required.</small>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="field grid">
                        {/* Grade */}
                        <div className="col-6">
                            <div className="field grid">
                                <label htmlFor="grade" className="col-4 mb-0">Grade</label>
                                <div className="col-8" id="grade">
                                    <Dropdown
                                        value={selectedExternalInfo.grade}
                                        onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, grade: e.value })}
                                        options={grades}
                                        itemTemplate={gradeTemplate}
                                        valueTemplate={selectedExternalInfo.grade ? gradeTemplate : ""}
                                        placeholder="Select a Grade"
                                        optionLabel="_id"
                                        filter
                                        className={classNames({
                                            'p-invalid': submitted && !selectedExternalInfo.grade,
                                        })}
                                    />
                                    {submitted && !selectedExternalInfo.grade && <small className="p-invalid">Grade is required.</small>}
                                </div>
                            </div>
                        </div>
                        {/* Average Result */}
                        <div className="col-6">
                            <div className="field grid">
                                <label htmlFor="average_result" className="col-4 mb-0">Average Result</label>
                                <div className="col-8">
                                    <InputNumber
                                        id="average_result"
                                        value={selectedExternalInfo.average_result}
                                        onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, average_result: e.value || 0 })}
                                        min={0}
                                        max={100}
                                        required
                                        className={classNames({
                                            'p-invalid': submitted && (selectedExternalInfo.average_result == null || selectedExternalInfo.average_result < 0 || selectedExternalInfo.average_result > 100),
                                        })}
                                    />
                                    {submitted && (selectedExternalInfo.average_result == null || selectedExternalInfo.average_result < 0 || selectedExternalInfo.average_result > 100) && <small className="p-invalid">Average Result is required and must be between 0 and 100.</small>}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Status */}
                    <div className="field grid">
                        <label htmlFor="status" className="col-2 mb-0">Status</label>
                        <div className="col-10">
                            <Dropdown
                                id="status"
                                value={selectedExternalInfo.status}
                                options={[{ label: 'Passed', value: 'PASSED' }, { label: 'Failed', value: 'FAILED' }, { label: 'Incomplete', value: 'INCOMPLETE' }]}
                                onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, status: e.value })}
                                required
                                placeholder="Select Status"
                                className={classNames({
                                    'p-invalid': submitted && !selectedExternalInfo.status,
                                })}
                            />
                            {submitted && !selectedExternalInfo.status && <small className="p-invalid">Status is required.</small>}
                        </div>
                    </div>

                    {/* Transfer Reason */}
                    <div className="field grid">
                        <label htmlFor="transferReason" className="col-2 mb-0">Transfer Reason</label>
                        <div className="col-10">
                            <InputText
                                id="transferReason"
                                value={selectedExternalInfo.transfer_reason || ''}
                                onChange={(e) => setSelectedExternalInfo({ ...selectedExternalInfo, transfer_reason: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            ) : (<>Student Has No School Information!</>)
            }
        </>
    );

    const renderStepContent = () => {
        switch (activeIndex) {
            case 0:
                return renderStudentFormContent();
            case 1:
                return renderExternalInfoFormContent();
            case 2:
                return <div>Confirmation Page Goes Here</div>;
            default:
                return null;
        }
    };

    const confirmDeleteItem = (student: Student) => {
        setSelectedStudent(student);
        setShowDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteStudent} />
        </>
    );

    const onUpload = async (event: any) => {
        if (!selectedStudent) {
            return;
        }
        try {
            let _students = [...students];
            const file = event.files[0];
            if (!file) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'No file selected',
                    detail: 'Please select a photo to upload',
                    life: 3000
                });
                return;
            }
            const updatedStudent = await StudentService.uploadStudentPhoto(selectedStudent, file);
            //console.log("Updated student:", updatedStudent);
            if (updatedStudent.photo && updatedStudent._id) {
                const index = findIndexById(updatedStudent._id);
                _students[index] = updatedStudent;
                toast.current?.show({
                    severity: 'info',
                    summary: 'Success',
                    detail: 'File Uploaded',
                    life: 3000
                });
                setStudents(_students);
            }

        } catch (error) {
            console.error("Error uploading photo:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to upload photo',
                detail: '' + error,
                life: 3000
            });
        }
        finally {
            setShowUploadDialog(false);
        }
    };


    const endToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Upload Photo" onClick={() => { setShowUploadDialog(true); }} disabled={!selectedStudent} className="mr-2 inline-block" />
            </React.Fragment>
        );
    };

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New Student" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Students</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: Student) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteItem(rowData)} />
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate} end={endToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={students}
                        selection={selectedStudent}
                        onSelectionChange={(e) => setSelectedStudent(e.value as Student)}
                        dataKey="_id"
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                        globalFilter={globalFilter}
                        emptyMessage="No students found."
                        header={header}
                        scrollable
                        filters={filters}
                        expandedRows={expandedClassRows}
                        onRowToggle={(e) => setExpandedClassRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <ExternalInfoComponent
                                student={data as Student}
                            />
                        )}
                    >
                        <Column expander style={{ width: '4em' }} />
                        <Column
                            header="#"
                            body={(rowData, options) => options.rowIndex + 1}
                            style={{ width: '50px' }}
                        />
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column
                            body={(rowData) => {
                                const [imgSrc, setImgSrc] = useState(MyService.photoURL(rowData.photo));

                                useEffect(() => {
                                    setImgSrc(MyService.photoURL(rowData.photo));
                                }, [rowData.photo]); // Update when the photo changes

                                return (
                                    <Avatar
                                        image={imgSrc}
                                        shape="circle"
                                        size="large"                                        
                                    />
                                );
                            }}
                            style={{ width: '6rem' }}
                        />
                        <Column field="first_name" header="First Name" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="last_name" header="Last Name" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="sex" header="Sex" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="birth_date" header="Birth Date" sortable headerStyle={{ minWidth: '10rem' }}
                            body={(rowData) => new Date(rowData.birth_date).toLocaleDateString('en-GB')} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '550px' }}
                        header={'New Student Details'}
                        modal
                        className="p-fluid"
                        footer={stepFooter}
                        onHide={hideSaveDialog}
                    >
                        <Steps model={steps} readOnly activeIndex={activeIndex} onSelect={(e) => setActiveIndex(e.index)} />
                        <div className="dialog-content" style={{ marginTop: '2rem' }}>
                            {selectedStudent && renderStepContent()}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={showEditDialog}
                        style={{ width: '550px' }}
                        header={'Edit Student Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        <div className="dialog-content">
                            {selectedStudent?._id && renderStudentFormContent()}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={showDeleteDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteDialogFooter}
                        onHide={hideDeleteDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedStudent && (
                                <span>
                                    Are you sure you want to delete <b>{selectedStudent.first_name} {selectedStudent.last_name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                    <Dialog
                        visible={showUploadDialog}
                        style={{ width: '450px' }}
                        header="Upload a Photo"
                        modal
                        onHide={() => { setShowUploadDialog(false) }}
                    >
                        <div className="flex align-items-center justify-content-center">
                            {selectedStudent && (
                                <FileUpload name="photo" uploadHandler={onUpload} customUpload accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;
