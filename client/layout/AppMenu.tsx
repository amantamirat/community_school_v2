/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import { PrimeIcons } from 'primereact/api';
import { useSession } from 'next-auth/react';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const { data: session } = useSession();

    let model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        }
    ];
    const enrollmentItems = [];

    if (session?.user?.roles?.includes('Principal') || session?.user?.roles?.includes('Home-Teacher') || session?.user?.roles?.includes('Teacher')) {
        if (session?.user?.roles?.includes('Principal') || session?.user?.roles?.includes('Home-Teacher')) {
            if (session?.user?.roles?.includes('Principal')) {
                enrollmentItems.push({
                    label: 'Registration',
                    icon: PrimeIcons.SIGN_IN,
                    items: [
                        { label: 'Returning', icon: PrimeIcons.SPINNER, to: '/pages/enrollment/registration/returning' },
                        {
                            label: 'New',
                            icon: PrimeIcons.PLUS,
                            items: [
                                { label: 'External', icon: PrimeIcons.PRIME, to: '/pages/enrollment/registration/external' },
                                { label: 'First Level', icon: PrimeIcons.SUN, to: '/pages/enrollment/registration/first_level' }

                            ]
                        }
                    ]
                });
            }

            enrollmentItems.push(
                { label: 'Registered', icon: PrimeIcons.ID_CARD, to: '/pages/enrollment/registerd_students' },
                { label: 'Section Classes', icon: PrimeIcons.TH_LARGE, to: '/pages/enrollment/grade_sections' },
                { label: 'Teacher Allocation', icon: PrimeIcons.USER_EDIT, to: '/pages/enrollment/teacher_class' },
            );
        }
        enrollmentItems.push({ label: 'Result Entry', icon: PrimeIcons.STEP_FORWARD, to: '/pages/enrollment/result_entry' });
        model.push({
            label: 'Enrollment',
            items: enrollmentItems
        });
    }

    const manageItems = [];
    if (session?.user?.roles?.includes('Principal') || session?.user?.roles?.includes('Administrator')) {
        if (session?.user?.roles?.includes('Principal')) {
            manageItems.push(
                { label: 'Academic Session', icon: PrimeIcons.CALENDAR, to: '/pages/academic_session' },
                { label: 'Curricula', icon: PrimeIcons.BOOK, to: '/pages/curricula_pages' }
            );
        }
        manageItems.push({ label: 'Students', icon: "pi pi-fw pi-graduation-cap", to: '/pages/students' });
        if (session?.user?.roles?.includes('Administrator')) {
            manageItems.push(
                { label: 'Teachers', icon: PrimeIcons.USER_PLUS, to: '/pages/teachers_pages' },
                { label: 'User Accounts', icon: "pi pi-fw pi-users", to: '/pages/users' }
            );
        }
        model.push({
            label: 'Manage',
            items: manageItems
        });
    }

    model.push({
        label: 'Get Started',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-question',
                to: '/documentation'
            }
        ]
    });

    const model2: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Enrollment',
            items: [
                { label: 'Registered', icon: PrimeIcons.ID_CARD, to: '/pages/enrollment/registerd_students' },
                {
                    label: 'Registration',
                    icon: PrimeIcons.SIGN_IN,
                    items: [
                        { label: 'Returning', icon: PrimeIcons.SPINNER, to: '/pages/enrollment/registration/returning' },
                        {
                            label: 'New',
                            icon: PrimeIcons.PLUS,
                            items: [
                                { label: 'External', icon: PrimeIcons.PRIME, to: '/pages/enrollment/registration/external' },
                                { label: 'First Level', icon: PrimeIcons.SUN, to: '/pages/enrollment/registration/first_level' }

                            ]
                        }
                    ]
                },
                { label: 'Section Classes', icon: PrimeIcons.TH_LARGE, to: '/pages/enrollment/grade_sections' },
                { label: 'Teacher Allocation', icon: PrimeIcons.USER_EDIT, to: '/pages/enrollment/teacher_class' },
                { label: 'Result Entry', icon: PrimeIcons.STEP_FORWARD, to: '/pages/enrollment/result_entry' }
            ]
        },
        {
            label: 'Manage',
            items: manageItems
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
                    label: 'Not Found',
                    icon: 'pi pi-fw pi-exclamation-circle',
                    to: '/pages/notfound'
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
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
