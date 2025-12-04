import type { ReactNode } from 'react';

type Props = {
    children?: ReactNode;
};

function Layout({ children }: Props) {
    return (
        <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 text-white min-h-screen">
            {children}
        </div>
    );
}
export default Layout;