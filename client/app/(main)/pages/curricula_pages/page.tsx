'use client';
import { TabPanel, TabView } from 'primereact/tabview';
import React from 'react';
import CurriculumsPage from './curricula/page';
import SubjectsPage from './subjects/page';

const CurriculumMainPage = () => {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <TabView>
                        <TabPanel header="Curricula">
                            <CurriculumsPage />
                        </TabPanel>
                        <TabPanel header="Subjects">
                            <SubjectsPage />
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default CurriculumMainPage;
