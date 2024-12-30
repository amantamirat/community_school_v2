'use client';
import { TabPanel, TabView } from 'primereact/tabview';
import React from 'react';
import DepartmentsPage from './departments/page';
import TeachersPage from './teachers/page';

const TeacherMainPage = () => {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <TabView>
                        <TabPanel header="Teachers">
                            <TeachersPage />
                        </TabPanel>
                        <TabPanel header="Departments">
                            <DepartmentsPage />
                        </TabPanel>
                    </TabView>
                </div>

            </div>
        </div>
    );
};

export default TeacherMainPage;
