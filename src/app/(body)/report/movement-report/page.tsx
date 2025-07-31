"use client";

import Report from "@/components/Report";
import { useMovementStore } from "@/utils/movementStore";
import { useEffect } from "react";

const page = () => {

    const { fetchMovementEntries, entries } = useMovementStore()

    useEffect(() => {
        fetchMovementEntries()
    }, [])






    return (
        //@ts-ignore
        <Report data={entries} heading="Maalkhana Movement Report" />
    )
}

export default page