'use client';
import { TabPanel, TabView } from 'primereact/tabview';
import React from 'react';
const RegistrationMainPage = () => {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <TabView>
                        <TabPanel header="Enrollment">
                            <>Display elligible student</>
                        </TabPanel>
                        <TabPanel header="Registred">
                            <>Display registered student</>
                        </TabPanel>
                        <TabPanel header="Students">
                            <>Manage students</>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default RegistrationMainPage;
