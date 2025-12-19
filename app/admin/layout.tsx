import { Metadata } from 'next';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';

export const metadata: Metadata = {
  title: 'Admin Portal - My Carer',
  description: 'Admin portal for managing carer services platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}

