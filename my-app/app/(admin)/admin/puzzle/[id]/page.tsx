import AdminPuzzleViewClient from './AdminPuzzleViewClient';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function Page() {
  return <AdminPuzzleViewClient />;
}
