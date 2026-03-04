import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useState, useMemo } from "react";
import AlertGrid from '../components/alerts/AlertGrid';
import AlertFilter from '../components/alerts/AlertFilter';

const Alerts = ({alerts, updateAlertStatus}) => {
    const [status, setStatus] = useState("all");

    const filteredAlerts = useMemo(() => {
        return alerts.filter((a) => {
            const matchesStatus = status === "all" ? true : a.status === status;

            return matchesStatus;
        });
    }, [alerts, status]);


    return (
        <>
            <DashboardHeader />
            <div className="mt-4">
                <AlertFilter status={status} setStatus={setStatus} />
            </div>

            <div className="mt-6">
                <AlertGrid alerts={filteredAlerts} updateAlertStatus={updateAlertStatus}/>
            </div>
        </>
    );
}

export default Alerts;
