import React from 'react'
import AlertItem from '../dashboard/AlertItem'

const AlertGrid = ({alerts, updateAlertStatus}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {alerts.map(a => (
                <AlertItem key={a.id} alert={a} updateAlertStatus={updateAlertStatus}/>
            ))}
        </div> 
    )
}   

export default AlertGrid
