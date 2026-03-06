import ResetPasswordClient from './ResetPasswordClient';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
    return [{ token: 'default' }];
}

export default function Page() {
    return <ResetPasswordClient />;
}
