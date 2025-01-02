'use client';
import CurriculumGradeComponent from '@/app/(main)/components/curriculum_grades/page';
import { CurriculumService } from '@/services/CurriculumService';
import { GradeService } from '@/services/GradeService';
import { emptyCurriculum, Curriculum, Grade } from '@/types/model';
import { gradeTemplate } from '@/types/templates';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';



const CurriculumPage = () => {

    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<Grade[] | null>(null);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum>(emptyCurriculum);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [expandedGradeRows, setExpandedGradeRows] = useState<any[] | DataTableExpandedRows>([]);


    useEffect(() => {
        initFilters();
        loadGrades();
        loadCurriculums();
    }, []);

    const loadGrades = async () => {
        try {
            const data = await GradeService.getGrades();
            setGrades(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load grades:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load grades',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const loadCurriculums = async () => {
        try {
            const data = await CurriculumService.getCurriculums();
            setCurriculums(data); // Update state with fetched data
        } catch (err) {
            console.error('Failed to load curricula:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load curricula',
                detail: '' + err,
                life: 3000
            });
        }
    };

    const saveCurriculum = async () => {
        setSubmitted(true);
        let _curriculums = [...(curriculums as any)];
        if (editMode) {
            try {
                let id = selectedCurriculum._id || '';
                const updatedCurriculum = await CurriculumService.updateCurriculum(id, selectedCurriculum);
                const index = findIndexById(id);
                _curriculums[index] = updatedCurriculum;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Curriculum Updated',
                    life: 3000
                });
            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to update curriculum',
                    detail: '' + error,
                    life: 3000
                });
            }
        } else {
            try {
                let processedGrades = selectedGrades?.map(grade => ({
                    grade: grade._id,
                    subjects: [],
                }));

                let preparedCurriculum = {
                    ...selectedCurriculum,
                    grades: processedGrades,
                };

                console.log(preparedCurriculum)
                const newCurriculum = await CurriculumService.createCurriculum(preparedCurriculum as Curriculum);
                console.log("Created Curriculum:", newCurriculum);
                _curriculums.push(newCurriculum);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Curriculum Created',
                    life: 3000
                });
            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Failed to create curriculums',
                    detail: '' + error,
                    life: 3000
                });
            }
        }
        setCurriculums(_curriculums as any);
        setShowSaveDialog(false);
        setEditMode(false);
        setSelectedCurriculum(emptyCurriculum);
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (curriculums as any)?.length; i++) {
            if ((curriculums as any)[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const deleteCurriculum = async () => {
        try {
            const deleted = await CurriculumService.deleteCurriculum(selectedCurriculum._id || "");
            if (deleted) {
                let _curriculums = (curriculums as any)?.filter((val: any) => val._id !== selectedCurriculum._id);
                setCurriculums(_curriculums);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Curriculum Deleted',
                    life: 3000
                });
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete curriculums',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedCurriculum(emptyCurriculum);
    };


    const openSaveDialog = () => {
        setEditMode(false);
        setSelectedGrades([]);
        setSelectedCurriculum(emptyCurriculum);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (curriculum: Curriculum) => {
        setEditMode(true);
        setSelectedCurriculum({ ...curriculum });
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const hideSaveDialog = () => {
        setSubmitted(false);
        setShowSaveDialog(false);
    };

    const saveDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideSaveDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveCurriculum} />
        </>
    );

    const confirmDeleteItem = (curriculum: Curriculum) => {
        setSelectedCurriculum(curriculum);
        setShowDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteCurriculum} />
        </>
    );

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New Curriculum" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
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

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Curricula</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search ..." />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: Curriculum) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteItem(rowData)} />
            </>
        );
    };

    const handleUpdate = (updatedCurriculum: Curriculum) => {
        setCurriculums((prevCurriculums) =>
            prevCurriculums.map((curriculum) =>
                curriculum._id === updatedCurriculum._id ? updatedCurriculum : curriculum
            )
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={curriculums}
                        selection={selectedCurriculum}
                        onSelectionChange={(e) => setSelectedCurriculum(e.value as Curriculum)}
                        dataKey="_id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} curriculums"
                        globalFilter={globalFilter}
                        emptyMessage="No curriculums found."
                        header={header}
                        filters={filters}
                        expandedRows={expandedGradeRows}
                        onRowToggle={(e) => setExpandedGradeRows(e.data)}
                        rowExpansionTemplate={(data) => (
                            <CurriculumGradeComponent
                                curriculum={data as Curriculum}
                                grades={grades}
                                updateCurriculum={handleUpdate}
                            />
                        )}
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="title" header="Curriculum Title" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="minimum_load" header="Minimum Load" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="maximum_load" header="Maximum Load" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="minimum_pass_mark" header="Minimum Pass Mark" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={editMode ? 'Edit Curriculum Details' : 'New Curriculum Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        {selectedCurriculum ? (<><div className="field">
                            <label htmlFor="title">Curriculum Title</label>
                            <InputText
                                id="title"
                                value={selectedCurriculum.title}
                                onChange={(e) => setSelectedCurriculum({ ...selectedCurriculum, title: e.target.value })}
                                required
                                autoFocus
                            />
                            {submitted && !selectedCurriculum.title && <small className="p-invalid">Curriculum Title is required.</small>}
                        </div>

                            <div className="field">
                                <label htmlFor="minimum_load">Minimum Load (hours/credits per week)</label>
                                <InputNumber
                                    id="minimum_load"
                                    value={selectedCurriculum.minimum_load}
                                    onValueChange={(e) => setSelectedCurriculum({ ...selectedCurriculum, minimum_load: e.value || 0 })}
                                    required
                                />
                                {submitted && selectedCurriculum.minimum_load <= 0 && <small className="p-invalid">Minimum Load must be greater than 0.</small>}
                            </div>

                            <div className="field">
                                <label htmlFor="maximum_load">Maximum Load (hours/credits per week)</label>
                                <InputNumber
                                    id="maximum_load"
                                    value={selectedCurriculum.maximum_load}
                                    onValueChange={(e) => setSelectedCurriculum({ ...selectedCurriculum, maximum_load: e.value || 0 })}
                                    required
                                />
                                {submitted && selectedCurriculum.maximum_load <= 0 && <small className="p-invalid">Maximum Load must be greater than 0.</small>}
                            </div>

                            <div className="field">
                                <label htmlFor="minimum_pass_mark">Minimum Pass Mark</label>
                                <InputNumber
                                    id="minimum_pass_mark"
                                    value={selectedCurriculum.minimum_pass_mark}
                                    max={100}
                                    onValueChange={(e) => setSelectedCurriculum({ ...selectedCurriculum, minimum_pass_mark: e.value || 50 })}
                                    required
                                />
                                {submitted && selectedCurriculum.minimum_pass_mark <= 0 && <small className="p-invalid">Minimum Pass Mark must be greater than 0.</small>}
                            </div>
                            {editMode ? <></> : <>
                                <div className="field">
                                    <label htmlFor="grades">Grades</label>
                                    <div id="grades">
                                        <MultiSelect
                                            value={selectedGrades}
                                            onChange={(e) => setSelectedGrades(e.value)}
                                            options={grades}
                                            itemTemplate={gradeTemplate}
                                            optionLabel="level"
                                            placeholder="Select Grades"
                                            filter
                                            className="multiselect-custom"
                                            display="chip"
                                        />
                                    </div>
                                </div>
                            </>}
                        </>) : (<></>)}
                    </Dialog>
                    <Dialog
                        visible={showDeleteDialog}
                        style={{ width: '450px' }}
                        header="Confirm to Delete Curriculum"
                        modal
                        footer={deleteDialogFooter}
                        onHide={hideDeleteDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedCurriculum && (
                                <span>
                                    Are you sure you want to delete <b>{selectedCurriculum.title}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CurriculumPage;
