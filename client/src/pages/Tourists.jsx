import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TouristTable from '../components/tourists/TouristTable';
import SearchFilterBar from '../components/tourists/SearchFilterBar';
import { useState, useMemo } from "react";

const Tourists = ({tourists}) => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const filteredTourists = useMemo(() => {
        return tourists.filter((t) => {
            const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = status === "all" ? true : t.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [tourists, search, status]);

    return (
        <>
            <DashboardHeader />
            <SearchFilterBar search={search} setSearch={setSearch} status={status} setStatus={setStatus}/>
            <TouristTable tourists={filteredTourists}/>
        </>
    );
}

export default Tourists;
