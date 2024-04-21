import { Task } from 'gantt-task-react'
import React from 'react'
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { deepOrange } from '@mui/material/colors';
import Summary from './Summary';
import Reports from './Reports';

interface DisplayComponentProps {
  task: Task;
}

const GanttTaskSummary: React.FC<DisplayComponentProps> = ({ task }) => {

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
              }}>
              <Tab label="Summary" value="1" />
              <Tab label="Reports" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <Summary task={task} />
          </TabPanel>
          <TabPanel className='px-1' value="2">
            <Reports task={task} />
          </TabPanel>
        </TabContext>
      </Box>
    </div>
  )
}

export default GanttTaskSummary