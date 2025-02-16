import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'WKU CS',
    description: 'Wolkite University Community School Management System.',
    robots: { index: false, follow: false },
    openGraph: {
        type: 'website',
        title: 'WKU-CS',
        url: 'https://www.wku.edu.et/',
        description: 'Wolkite University Community School Management System.',
        images: ['https://www.primefaces.org/static/social/sakai-react.png'],
        ttl: 604800
    },
    icons: {
        icon: '/favicon.ico'
    }
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
  };

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}
