"use client";

import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { useEffect } from "react";

const page = () => {


    const { user } = useAuthStore()

    const alldata = async () => {
        try {
            const response = await axios.get(`api/district/entries?districtId=${user?.id}`);
            console.log(response);
        } catch (error) {

        }
    }

    useEffect(() => {
        alldata()
    }, [])
    return (
        <div className="h-screen">page</div>
    )
}

export default page