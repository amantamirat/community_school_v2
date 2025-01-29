'use client';
import { TabPanel, TabView } from 'primereact/tabview';
import DepartmentsPage from './departments/page';
import TeachersPage from './teachers/page';

const TeacherMainPage = () => {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <TabView>
                        <TabPanel header="Teachers" leftIcon="pi pi-users ml-2">
                            <TeachersPage />
                        </TabPanel>
                        <TabPanel header="Departments" leftIcon="pi pi-clone ml-2">
                            <DepartmentsPage />
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default TeacherMainPage;
