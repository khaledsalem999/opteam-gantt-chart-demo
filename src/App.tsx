import React from 'react';
import logo from './logo.svg';
import './App.css';
import GanttChart from './components/GanttChart/GanttChart';
import Header from './components/Header/Header';
import Seperator from './components/Seperator/Seperator';

function App() {
  return (
    <div>
      <Header/>
      <div className='px-4 mt-3'>
        <Seperator/>
      </div>
      <div className='px-4 py-3'>
        <GanttChart/>
      </div>
    </div>
  );
}

export default App;
