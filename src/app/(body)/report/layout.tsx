import ReportHeader from '@/components/ReportHeader';
import React from 'react';

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <div>
            <ReportHeader />
            {children}


        </div>
    )
}

export default layout