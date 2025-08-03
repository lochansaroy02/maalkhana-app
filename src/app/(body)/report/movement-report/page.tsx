"use client";

import Report from "@/components/Report";
import { useMovementStore } from "@/store/movementStore";
import { useEffect } from "react";

const page = () => {

    const { fetchMovementEntries, entries } = useMovementStore()

    useEffect(() => {
        fetchMovementEntries()
    }, [])






    return (
        //@ts-ignore
        <Report data={entries} link="/maalkhana-movement" heading="Maalkhana Movement Report" />
    )
}

export default page