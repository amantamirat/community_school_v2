'use client';
import { MyService } from '@/services/MyService';
import { UserService } from '@/services/UserService';
import { Role, User } from '@/types/model';
import { FilterMatchMode } from 'primereact/api';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';


const roles: { label: string, value: Role }[] = [
    { label: 'Administrator', value: 'Administrator' },
    { label: 'Principal', value: 'Principal' },
    { label: 'Home-Teacher', value: 'Home-Teacher' },
    { label: 'Teacher', value: 'Teacher' }
];

const UserPage = () => {
    let emptyUser: User = {
        username: '',
        password:'',
        email: '',
        roles:[]
    };

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User>(emptyUser);
    const [showSaveDialog, setShowSaveDialog] = useState(false);    
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({});

    useEffect(() => {
        initFilters();
        UserService.getUsers().then((data) => {
            setUsers(data);
        }).catch((err) => {
            console.error('Failed to load users:', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to load users',
                detail: '' + err,
                life: 3000
            });
        });

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

    const validateUser = (user: User) => {
        if (user.username.trim() === '' || user.password?.trim() === '') {
            return false;
        }
        return true;
    };

    const saveUser = async () => {
        setSubmitted(true);
        if (!validateUser(selectedUser)) {
            return;
        }
        let _users = [...(users as any)];
        try {
            if (selectedUser._id) {
                //console.log(selectedUser);
                const updatedUser = await UserService.updateUser(selectedUser);
                if (updatedUser) {
                    const index = users.findIndex((user) => user._id === updatedUser._id);
                    _users[index] = updatedUser;
                }
            } else {
                const newUser = await UserService.createUser(selectedUser);
                if (newUser._id) {
                    //const user = { ...selectedUser, _id: newUser._id }
                    _users.push(newUser);
                }
            }
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: `User ${selectedUser._id ? "updated" : 'created'}`,
                life: 3000
            });
        } catch (error) {
            //console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: `Faild to ${selectedUser._id ? "update" : 'create'} user!`,
                detail: '' + error,
                life: 3000
            });
        }
        finally {
            setShowSaveDialog(false);
            setSelectedUser(emptyUser);
            setUsers(_users);
        }
    };

    const deleteUser = async () => {
        try {
            if (selectedUser._id) {
                const deleted = await UserService.deleteUser(selectedUser);
                if (deleted) {
                    let _users = (users as any)?.filter((val: any) => val._id !== selectedUser._id);
                    setUsers(_users);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Deleted',
                        life: 3000
                    });
                }
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to delete user',
                detail: '' + error,
                life: 3000
            });
        }
        setShowDeleteDialog(false);
        setSelectedUser(emptyUser);
    };

    const openSaveDialog = () => {
        setSelectedUser(emptyUser);
        setSubmitted(false);
        setShowSaveDialog(true);
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
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
            <Button label="Save" icon="pi pi-check" text onClick={saveUser} />
        </>
    );

    const confirmDeleteItem = (user: User) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Delete" icon="pi pi-check" text onClick={deleteUser} />
        </>
    );

    const onUpload = async (event: any) => {
        if (!selectedUser) return;
        const file = event.files[0];
        if (!file) return;

        let _users = [...users];
        try {
            const updatedUser = await UserService.uploadUserPhoto(selectedUser, file);
            if (updatedUser.photo && updatedUser._id) {
                const index = _users.findIndex((tea) => tea._id === updatedUser._id);
                if (index !== -1) {
                    _users[index] = { ..._users[index], photo: updatedUser.photo };
                }
                toast.current?.show({
                    severity: 'info',
                    summary: 'Success',
                    detail: 'File Uploaded',
                    life: 3000
                });
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Failed to upload photo',
                detail: '' + error,
                life: 3000
            });
        } finally {
            setUsers(_users);
            setShowUploadDialog(false);
        }
    };

    const endToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Upload Photo" onClick={() => { setShowUploadDialog(true); }} disabled={!selectedUser} className="mr-2 inline-block" />
            </React.Fragment>
        );
    };

    const startToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New User" icon="pi pi-plus" severity="success" className="mr-2" onClick={openSaveDialog} />
                </div>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Users</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." className="w-full md:w-1/3" />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: User) => {
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
                        value={users}
                        selection={selectedUser}
                        onSelectionChange={(e) => setSelectedUser(e.value as User)}
                        dataKey="_id"
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                        globalFilter={globalFilter}
                        emptyMessage="No users found."
                        header={header}
                        scrollable
                        filters={filters}
                    >
                        <Column selectionMode="single" headerStyle={{ width: '3em' }}></Column>
                        <Column
                            header="#"
                            body={(rowData, options) => options.rowIndex + 1}
                            style={{ width: '50px' }}
                        />
                        <Column
                            body={(rowData) => {
                                const imgSrc = rowData.photo ? MyService.photoURL(rowData.photo) : '/images/default_male_teacher.jpg';
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
                        <Column field="username" header="User Name" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="email" header="Email" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="roles" header="Role" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={showSaveDialog}
                        style={{ width: '450px' }}
                        header={selectedUser?._id ? 'Edit User Details' : 'New User Details'}
                        modal
                        className="p-fluid"
                        footer={saveDialogFooter}
                        onHide={hideSaveDialog}
                    >
                        {selectedUser ? (<>
                            <div className="field">
                                <label htmlFor="username">User Name</label>
                                <InputText
                                    id="username"
                                    value={selectedUser.username}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !selectedUser.username,
                                    })}
                                />
                                {submitted && !selectedUser.username && <small className="p-invalid">User Name is required.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="email">Email</label>
                                <InputText
                                    id="email"
                                    value={selectedUser?.email}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="password">Password</label>
                                <InputText
                                    id="password"
                                    value={selectedUser?.password}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                                    required
                                    className={classNames({
                                        'p-invalid': submitted && !selectedUser?.password,
                                    })}
                                />
                                {submitted && !selectedUser?.password && <small className="p-invalid">Password is required.</small>}
                            </div>
                            <div>
                                {selectedUser?._id &&
                                    <div className="field">
                                        <label htmlFor="roles">Roles</label>
                                        <MultiSelect
                                            value={selectedUser?.roles}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, roles: e.value })}
                                            options={roles}
                                            optionLabel="label"
                                            display="chip"
                                            placeholder="Select Roles"
                                            maxSelectedLabels={3}
                                            className="w-full"
                                            style={{ width: '100%', minWidth: '300px', maxWidth: '500px' }}
                                        />
                                        {submitted && !selectedUser?.roles && <small className="p-invalid">Roles required.</small>}
                                    </div>
                                }
                            </div>
                        </>) : <></>}
                    </Dialog>

                    <Dialog
                        visible={showUploadDialog}
                        style={{ width: '450px' }}
                        header="Upload a Photo"
                        modal
                        onHide={() => { setShowUploadDialog(false) }}
                    >
                        <div className="flex align-items-center justify-content-center">
                            {selectedUser && (
                                <FileUpload name="photo" uploadHandler={onUpload} customUpload accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                            )}
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
                            {selectedUser && (
                                <span>
                                    Are you sure you want to delete <b>{selectedUser.username}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default UserPage;
