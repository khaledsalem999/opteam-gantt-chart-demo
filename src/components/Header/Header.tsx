import {useState, SyntheticEvent} from 'react'
import opteamLogo from '../../Assets/opteamlogo.png'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Avatar from '@mui/material/Avatar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { deepOrange } from '@mui/material/colors';
import './Header.css'

function Header() {

  const [value, setValue] = useState(1);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className='d-flex justify-content-between header-container px-4'>
      <div className='d-flex'>
        <div className='my-auto'>
          <img src={opteamLogo} />
        </div>
        <div className='margin-left-sm'>
          <Tabs
            value={value}
            onChange={handleChange}
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
            }}
            aria-label="secondary tabs example"
          >
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="Projects" {...a11yProps(1)} />
            <Tab label="Reports" {...a11yProps(2)} />
          </Tabs>
        </div>
      </div>
      <div className='d-flex'>
        <div className='my-auto'>
          <NotificationsNoneIcon/>
        </div>
        <div className='my-auto mx-3'>
          <Avatar sx={{ bgcolor: deepOrange[500], width: 28, height: 28 }}></Avatar>
        </div>
        <div className='my-auto d-block'>
          <KeyboardArrowDownIcon/>
        </div>
      </div>
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


export default Header