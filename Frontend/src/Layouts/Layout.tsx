import type { ReactNode } from 'react';

type Props = {
    children?: ReactNode;
};

function Layout({ children }: Props) {
    return (
        <div className="bg-linear-to-br from-gray-950 via-zinc-900 to-stone-900 text-white">
            
            {children}
        </div>
    );
}
export default Layout;