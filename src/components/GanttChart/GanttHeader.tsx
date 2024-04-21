import { CSSProperties } from 'react'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './GanttChart.css'

const todayExportButtonStyle: CSSProperties = {
    backgroundColor: "#F6F7FD",
    textTransform: 'none',
    boxShadow: 'none',
    color: 'black',
    marginRight: 20
}

const monthDayButtonStyle: CSSProperties = {
    backgroundColor: "#F6F7FD",
    textTransform: 'none',
    boxShadow: 'none',
    color: 'black'
}

const addReportButtonStyle: CSSProperties = {
    backgroundColor: "#FF5722",
    textTransform: 'none',
    boxShadow: 'none'
}

const GanttHeader = () => {
    return (
        <div className='d-flex p-3 justify-content-between gantt-header'>
            <div className='d-flex'>
                <Button variant="contained" size="small" style={todayExportButtonStyle}>
                    <span className='fw-bold'>Today</span>
                </Button>
                <Button variant="contained" size="small" style={monthDayButtonStyle}>
                    <CalendarTodayIcon fontSize="small" />
                    <span className='fw-bold'>Month/Day</span>
                </Button>
            </div>
            <div className='my-auto'>
                <Button variant="contained" size="small" style={todayExportButtonStyle}>
                    <span className='fw-bold'>Export</span>
                    <KeyboardArrowDownIcon />
                </Button>
                <Button variant="contained" size="small" className='margin-left-sm fw-bold' style={addReportButtonStyle}>Add Report</Button>
            </div>
        </div>
    )
}

export default GanttHeader