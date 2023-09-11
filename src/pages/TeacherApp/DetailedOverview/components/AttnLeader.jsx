import React, { useState, useEffect } from "react"
import './AttnLeader.scss'
// import Chart from "react-apexcharts";
import { BarChart, Trophy } from "../assets/icons";

const AttnLeader = () => {
    const optionsObject = {
        series: [80, 17, 3],
        colors: ["#01AA93", "#AA0B01", "#EEEEEE"],
        labels: ["Present", "In-active", "Absent"],
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '73%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: "12px"
                        },
                        value: {
                            show: true,
                            fontSize: "12px",
                            formatter: function (value) {
                                return value + "%"
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: false,
        }
    }
    const series = [80, 17, 3]
    const [options, setOptions] = useState(optionsObject)
    return <>
        <div className='attendanceholder'>
            <div className='info-card' style={{ display: 'flex', flexDirection: 'column' }}>
                <div className='info-card-heading'>
                    <div className='info-card-title-student'>
                        Student Attendance
                    </div>
                    <button className='info-card-detail-button'>
                        <p className='info-card-detail-text'>
                            View Details
                        </p>
                    </button>
                </div>
                <div className='chart-holder'>
                    {/* <Chart 
                options={options}
                series={series}
                type="donut"
                width="100%"
                height="100%"
                /> */}
                </div>
            </div>
            <div className='info-card-leaderboard'>
                <div className='info-card-circle' />
                <div className='info-card-heading'>
                    <div className='info-card-title'>
                        Class Leaderboard
                    </div>
                    <button className='info-card-button'>
                        <div className="barchart-holder">
                        <BarChart/>
                        </div>
                        <div className='info-card-text'>View Podium</div>
                    </button>
                </div>
                <div className='trophy-container'>
                    <Trophy />
                </div>
            </div>
        </div>
    </>
}

export default AttnLeader