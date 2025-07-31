import Header from '@/components/Header';
import React from 'react'

const layout = ({ children, }: Readonly<{ children: React.ReactNode; }>) => {
    return (
        <div>
            <Header />
            {children}
        </div>
    )
}

export default layout