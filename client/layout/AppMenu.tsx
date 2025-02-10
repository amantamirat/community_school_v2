/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import { PrimeIcons } from 'primereact/api';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Manage',
            items: [
                {
                    label: 'Enrollment',
                    icon: PrimeIcons.SYNC,
                    items: [
                        { label: 'Registered', icon: PrimeIcons.ID_CARD, to: '/pages/enrollment/registerd_students' },
                        {
                            label: 'Registration',
                            icon: PrimeIcons.SIGN_IN,
                            items: [
                                { label: 'External', icon: PrimeIcons.PRIME, to: '/pages/enrollment/registration/external' },
                                { label: 'First Level', icon: PrimeIcons.SUN, to: '/pages/enrollment/registration/first_level' }
                            ]
                        },
                        { label: 'Section Classes', icon: PrimeIcons.TH_LARGE, to: '/pages/enrollment/grade_sections' },
                        { label: 'Teacher Allocation', icon: PrimeIcons.USER_EDIT, to: '/pages/enrollment/teacher_class' },
                        { label: 'Result Entry', icon: PrimeIcons.STEP_FORWARD, to: '/pages/enrollment/result_entry' }
                    ]
                },
                { label: 'Academic Session', icon: PrimeIcons.CALENDAR, to: '/pages/academic_session' },
                { label: 'Curricula', icon: PrimeIcons.BOOK, to: '/pages/curricula_pages' },
                { label: 'Teachers', icon: PrimeIcons.USER_PLUS, to: '/pages/teachers_pages' },
                { label: 'Students', icon:"pi pi-fw pi-graduation-cap", to: '/pages/students' }
            ]
        },
        {
            label: 'Prime Blocks',
            items: [
                { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', to: '/blocks', badge: 'NEW' },
                { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: 'https://blocks.primereact.org', target: '_blank' }
            ]
        },
        {
            label: 'Utilities',
            items: [
                { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', to: '/utilities/icons' },
                { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: 'https://primeflex.org/', target: '_blank' }
            ]
        },
        {
            label: 'Pages',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Landing',
                    icon: 'pi pi-fw pi-globe',
                    to: '/landing'
                },
                {
                    label: 'Auth',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        {
                            label: 'Login',
                            icon: 'pi pi-fw pi-sign-in',
                            to: '/auth/login'
                        },
                        {
                            label: 'Error',
                            icon: 'pi pi-fw pi-times-circle',
                            to: '/auth/error'
                        },
                        {
                            label: 'Access Denied',
                            icon: 'pi pi-fw pi-lock',
                            to: '/auth/access'
                        }
                    ]
                },
                {
                    label: 'Crud',
                    icon: 'pi pi-fw pi-pencil',
                    to: '/pages/crud'
                },
                {
                    label: 'Timeline',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/pages/timeline'
                },
                {
                    label: 'Not Found',
                    icon: 'pi pi-fw pi-exclamation-circle',
                    to: '/pages/notfound'
                },
                {
                    label: 'Empty',
                    icon: 'pi pi-fw pi-circle-off',
                    to: '/pages/empty'
                }
            ]
        },
        {
            label: 'Get Started',
            items: [
                {
                    label: 'Documentation',
                    icon: 'pi pi-fw pi-question',
                    to: '/documentation'
                },
                {
                    label: 'Figma',
                    url: 'https://www.dropbox.com/scl/fi/bhfwymnk8wu0g5530ceas/sakai-2023.fig?rlkey=u0c8n6xgn44db9t4zkd1brr3l&dl=0',
                    icon: 'pi pi-fw pi-pencil',
                    target: '_blank'
                },
                {
                    label: 'View Source',
                    icon: 'pi pi-fw pi-search',
                    url: 'https://github.com/primefaces/sakai-react',
                    target: '_blank'
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}

                <Link href="https://blocks.primereact.org" target="_blank" style={{ cursor: 'pointer' }}>
                    <img alt="Prime Blocks" className="w-full mt-3" src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`} />
                </Link>
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
