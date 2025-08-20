"use client";

import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {
    const params = useParams()

    return (
        <div>movement entry report</div>
    )
}

export default page