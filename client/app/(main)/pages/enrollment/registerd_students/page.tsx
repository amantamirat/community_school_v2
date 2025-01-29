'use client';
import { TabPanel, TabView } from 'primereact/tabview';
import SectionedStudentsPage from './sectioned/page';
import UnsectionedStudentsPage from './unsectioned/page';

const RegisteredStudentsPage = () => {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <TabView>
                        <TabPanel header="Unsectioned">
                            <UnsectionedStudentsPage />
                        </TabPanel>
                        <TabPanel header="Sectioned">
                            <SectionedStudentsPage />
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default RegisteredStudentsPage;
