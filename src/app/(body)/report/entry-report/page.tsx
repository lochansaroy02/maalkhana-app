"use client";

import Report from '@/components/Report';
import { useMaalkhanaStore } from '@/utils/maalkhanaEntryStore';
import { useEffect } from 'react';

const page = () => {

    const { fetchMaalkhanaEntry, entries } = useMaalkhanaStore();
    useEffect(() => {
        fetchMaalkhanaEntry()
    }, [])



    return (
        //@ts-ignore
        <Report data={entries} heading='Maalkhana Data' />
    )
}

export default page