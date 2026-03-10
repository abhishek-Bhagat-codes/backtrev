import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { tourists, alerts } from '../data/dummyData';

const Reports = () => {
    // Categorize tourists by region based on lat/lng
    const categorizeByRegion = () => {
        const regions = { West: 0, South: 0, North: 0, Central: 0 };
        
        tourists.forEach(tourist => {
            const { lat, lng } = tourist.location;
            
            // Delhi region classification
            if (lat >= 28.63) {
                regions.North++;
            } else if (lat < 28.58) {
                regions.South++;
            } else if (lng < 77.18) {
                regions.West++;
            } else {
                regions.Central++;
            }
        });
        
        return regions;
    };

    const regionData = categorizeByRegion();

    const alertTypeCounts = alerts.reduce(
        (acc, alert) => {
            if (alert.type === "SOS") acc.SOS += 1;
            else if (alert.type === "Geo-fence") acc["Geo-fence"] += 1;
            else if (alert.type === "Anomaly") acc.Anomaly += 1;
            return acc;
        },
        { SOS: 0, "Geo-fence": 0, Anomaly: 0 }
    );

    return (
        <div className="space-y-4">
            <DashboardHeader page="Reports" />

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-85 rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">Tourist Activity Trend</h3>
                    <Bar 
                        data={{
                            labels: ["West", "South", "North", "Central"],
                            datasets: [
                                {
                                    label: "Number of Tourists",
                                    data: [
                                        regionData.West, 
                                        regionData.South, 
                                        regionData.North, 
                                        regionData.Central
                                    ],
                                    backgroundColor: [
                                        'rgba(59, 130, 246, 0.8)',
                                        'rgba(59, 130, 246, 0.8)',
                                        'rgba(59, 130, 246, 0.8)',
                                        'rgba(59, 130, 246, 0.8)',
                                    ],
                                    borderColor: [
                                        'rgb(59, 130, 246)',
                                        'rgb(59, 130, 246)',
                                        'rgb(59, 130, 246)',
                                        'rgb(59, 130, 246)',
                                    ],
                                    borderWidth: 1,
                                    borderRadius: 5,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: 'rgb(209, 213, 219)',
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        color: 'rgb(156, 163, 175)',
                                        stepSize: 1,
                                    },
                                    grid: {
                                        color: 'rgba(75, 85, 99, 0.3)',
                                    }
                                },
                                x: {
                                    ticks: {
                                        color: 'rgb(156, 163, 175)',
                                    },
                                    grid: {
                                        color: 'rgba(75, 85, 99, 0.3)',
                                    }
                                }
                            }
                        }}
                    />
                </div>

                <div className="h-85 rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">Risk Zone Comparison</h3>
                    
                </div>

                <div className="h-85 rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">Alert Type Distribution</h3>
                    <Doughnut 
                        data={{
                            labels: ["SOS", "Geo-fence"],
                            datasets: [
                                {
                                    label: "Number of Alerts",
                                    data: [
                                        alertTypeCounts.SOS,
                                        alertTypeCounts["Geo-fence"],
                                        alertTypeCounts.Anomaly,
                                    ],
                                    backgroundColor: [
                                        'rgba(239, 68, 68, 0.8)',
                                        'rgba(59, 130, 246, 0.8)',
                                        'rgba(245, 158, 11, 0.8)',
                                    ],
                                    borderColor: [
                                        'rgb(239, 68, 68)',
                                        'rgb(59, 130, 246)',
                                        'rgb(245, 158, 11)',
                                    ],
                                    borderWidth: 1,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: 'rgb(209, 213, 219)',
                                    }
                                }
                            },
                        }}
                    />
                </div>

                <div className="h-85 rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">Safety Score Summary</h3>
                    
                </div>
            </section>
        </div>
    );
}

export default Reports;
