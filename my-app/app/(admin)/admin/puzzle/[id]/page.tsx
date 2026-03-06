export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => [];

import AdminPuzzleViewClient from './AdminPuzzleViewClient';

export default function Page() {
  return <AdminPuzzleViewClient />;
}
