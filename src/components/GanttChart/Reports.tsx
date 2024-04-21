import React from 'react'
import { Task } from 'gantt-task-react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { red } from '@mui/material/colors';
import Button from '@mui/material/Button';


interface DisplayComponentProps {
    task: Task;
}

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


const Reports: React.FC<DisplayComponentProps> = ({ task }) => {
    return (
        <div>{task.progressReport.length !== 0 ? task.progressReport.map(report =>
            <div className='mb-3 p-3 border rounded-3'>
                <div className='d-flex'>
                    <div>
                        {report.isReportStatusPostive ? <CheckCircleOutlineIcon color='success' /> : <WarningAmberIcon sx={{ color: red[500] }} />}
                    </div>
                    <div className='mx-2'>
                        <b>{monthNames[report.reportStartDate.getMonth()]} {report.reportStartDate.getDate()} - {monthNames[report.reportEndDate.getMonth()]} {report.reportEndDate.getDate()}</b>
                    </div>
                </div>
                <div className='d-flex flex-column'>
                    <div className='d-flex'>
                        <span>Progress:</span>
                        <span className='fw-bold mx-1'>{` ${report.reportProgress}%`}</span>
                    </div>
                    <span>{`${report.reportComment}`}</span>
                </div>
            </div>) :
            <div className='d-flex'>
                <span className='fw-bold mx-auto mb-4'>No reports added</span>
            </div>}
            <Button variant="contained" size="small" className='margin-left-sm fw-bold w-100' style={{
                backgroundColor: "#FF5722",
                textTransform: 'none',
                boxShadow: 'none'
            }}>Add Report</Button></div>
    )
}

export default Reports