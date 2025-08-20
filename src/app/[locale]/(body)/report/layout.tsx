"use client";

import React from 'react';
//@ts-ignore
import Layout from './Layout';

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <Layout>{children}</Layout>
    )
}
export default layout