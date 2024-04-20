import { Task } from 'gantt-task-react'
import React from 'react'
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { red } from '@mui/material/colors';
import { deepOrange } from '@mui/material/colors';
import Button from '@mui/material/Button';

interface DisplayComponentProps {
    task: Task;
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const GanttTaskSummary : React.FC<DisplayComponentProps>  = ({task}) => {

    function progressStatus(){
        if(task.progress !== 100 && task.progress !== 0){
          console.log(task.progress);
            return "In progress";
        }else if (task.progress === 100){
            return "Completed";
        }else if (task.progress === 0){
            return "Not Started";
        }else {
            return "Not started";
        }
    }

    const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <div>
          <b>{task.name}</b>
          <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <TabList onChange={handleChange} 
                        TabIndicatorProps={{
                            sx: {
                              backgroundColor: deepOrange[500],
                              height: 3,
                            },
                          }}
                        sx={{
                          ".MuiButtonBase-root": {
                              textTransform: 'none',
                              fontWeight: 'bold',
                              "&.Mui-selected": {
                                color: deepOrange[500]
                            }
                          }
                      }} aria-label="lab API tabs example">
                          <Tab label="Summary" value="1" />
                          <Tab label="Reports" value="2" />
                      </TabList>
                  </Box>
                  <TabPanel value="1">
                      <div className='d-flex flex-column'>
                          <div className='d-flex justify-content-between'>
                              <span>Duration: </span>
                              {task.end.getTime() - task.start.getTime() !== 0 && (
                                  <span className='fw-bold'>{`${~~(
                                      (task.end.getTime() - task.start.getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )} day(s)`}</span>
                              )}
                          </div>
                          <div className='d-flex justify-content-between'>
                            <span>Status:</span>
                            <span className='fw-bold'>{`${progressStatus()}`}</span>
                          </div>
                          {!!task.progress && 
                          <div className='d-flex justify-content-between'>
                            <span>Progress:</span>
                            <span className='fw-bold'>
                              {`${task.progress} %`}
                            </span>
                          </div>
                          }
                          <div className='d-flex justify-content-between'>
                            <span>Description:</span>
                            <span className='fw-bold'>{`${task.description}`}</span>
                          </div>
                      </div>
                  </TabPanel>
                  <TabPanel className='px-1' value="2">
                    {task.progressReport.length !== 0 ? task.progressReport.map(report => 
                    <div className='mb-3 p-3 border rounded-3'>
                            <div className='d-flex'>
                                <div>
                                    {report.isReportStatusPostive ? <CheckCircleOutlineIcon color='success' /> : <WarningAmberIcon sx={{color: red[500]}}/>}
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
                    </div> }
                      <Button variant="contained" size="small" className='margin-left-sm fw-bold w-100' style={{
                          backgroundColor: "#FF5722",
                          textTransform: 'none',
                          boxShadow: 'none'
                      }}>Add Report</Button>
                  </TabPanel>
              </TabContext>
          </Box>
    </div>
  )
}

export default GanttTaskSummary