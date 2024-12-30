import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useRef, useState } from 'react';
import React from 'react';

type Curriculum = {
    _id?: string;
    title: string;
    minimum_load: number;
    maximum_load: number;
    minimum_pass_mark: number;
    grades: {
        grade: string;
        subjects: {
            subject: string;
        }[];
    }[];
};

const CurriculumPage = () => {
    let emptyCurriculum: Curriculum = {
        _id: '',
        title: '',
        minimum_load: 0,
        maximum_load: 0,
        minimum_pass_mark: 0,
        grades: [],
    };

    const [curricula, setCurricula] = useState<Curriculum[] | null>(null);
    const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum>(emptyCurriculum);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const openSaveDialog = () => {
        setEditMode(false);
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
            <Button label="Save" icon="pi pi-check" text />
        </>
    );

    const actionBodyTemplate = (rowData: Curriculum) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Curricula</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={startToolbarTemplate} />
                    <DataTable
                        ref={dt}
                        value={curricula}
                        selection={selectedCurriculum}
                        onSelectionChange={(e) => setSelectedCurriculum(e.value as Curriculum)}
                        dataKey="_id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} curricula"
                        globalFilter={globalFilter}
                        emptyMessage="No curricula found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
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
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        <div className="field">
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
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CurriculumPage;
