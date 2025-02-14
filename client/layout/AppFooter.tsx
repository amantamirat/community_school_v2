/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            <img src={`/images/wku_logo.png`} alt="logo" height="20" className="mr-2" />
            <span className="font-medium ml-2">WKU-CCI </span>
        </div>
    );
};

export default AppFooter;
