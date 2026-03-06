export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => [];

import AdminPuzzleEditClient from './AdminPuzzleEditClient';

export default function Page() {
  return <AdminPuzzleEditClient />;
}
