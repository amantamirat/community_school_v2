'use client';
import { ChildContainerProps } from '@/types';
import { ClassificationGradeProvider } from '../../contexts/classificationGradeContext';
import Layout from './layout/layout';
export default function EnrollmentLayout({ children }: ChildContainerProps) {
    return <ClassificationGradeProvider><Layout>{children}</Layout></ClassificationGradeProvider>;
}