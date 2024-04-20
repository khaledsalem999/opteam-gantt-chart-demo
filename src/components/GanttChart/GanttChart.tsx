import {useState, useEffect, useRef} from 'react'
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from 'gantt-task-react';
import Tasks from '../../data/Tasks';
import GanttTaskSummary from './GanttTaskSummary';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './GanttChart.css'
import { deepOrange } from '@mui/material/colors';

const addReportButtonStyle = {
  backgroundColor: "#FF5722",
  textTransform: 'none',
  boxShadow: 'none'
}

const exportAndDateButtonStyles = {
  backgroundColor: "#F6F7FD",
  textTransform: 'none',
  boxShadow: 'none'
}

function GanttChart() {

  const [tasks, setTasks] = useState<Task[]>(Tasks);
  const [showSummaryComponent, setShowSummaryComponent] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task>(Object);
  const [isChecked, setIsChecked] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  let columnWidth = 65;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setShowSummaryComponent(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  function getStartEndDateForProject(tasks: Task[], projectId: string) {
    const projectTasks = tasks.filter(t => t.project === projectId);
    let start = projectTasks[0].start;
    let end = projectTasks[0].end;
  
    for (let i = 0; i < projectTasks.length; i++) {
      const task = projectTasks[i];
      if (start.getTime() > task.start.getTime()) {
        start = task.start;
      }
      if (end.getTime() < task.end.getTime()) {
        end = task.end;
      }
    }
    return [start, end];
  }

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project = newTasks[newTasks.findIndex(t => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map(t =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setTasks(newTasks);
    setSelectedTask(task);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    if(task.progress === 100){
      task.styles = {
        progressColor: "#7CFC00",
        progressSelectedColor: "#228B22"
      }
    }else {
      task.styles = {
        progressColor: "#A3A3FF",
        progressSelectedColor: "#8282F5"
      }
    }
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    setSelectedTask(task);
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    
  };

  const handleClick = (task: Task) => {
    if(task.id === selectedTask.id && showSummaryComponent){
      setShowSummaryComponent(false);
    }else if(task.id === selectedTask.id && !showSummaryComponent){
      setShowSummaryComponent(true);
    }else if(task.id !== selectedTask.id && !showSummaryComponent){
      setShowSummaryComponent(true);
    }
    setSelectedTask(task);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };


  return (
    <div className='wrapper border' ref={componentRef}>
      <div className='d-flex p-3 justify-content-between gantt-header'>
        <div className='d-flex'>
        <Button variant="contained" size="small" style={{
            backgroundColor: "#F6F7FD",
            textTransform: 'none',
            boxShadow: 'none',
            color: 'black',
            marginRight: 20
          }}>
            <span className='fw-bold'>Today</span>
          </Button>
          <Button variant="contained" size="small" style={{
            backgroundColor: "#F6F7FD",
            textTransform: 'none',
            boxShadow: 'none',
            color: 'black'
          }}>
            <CalendarTodayIcon fontSize="small"/>
            <span className='fw-bold'>Month/Day</span>
          </Button>
        </div>
        <div className='my-auto'>
          <Button variant="contained" size="small" style={{
            backgroundColor: "#F6F7FD",
            textTransform: 'none',
            boxShadow: 'none',
            color: 'black',
            marginRight: 20
          }}>
            <span className='fw-bold'>Export</span>
            <KeyboardArrowDownIcon/>
          </Button>
          <Button variant="contained" size="small" className='margin-left-sm fw-bold' style={{
            backgroundColor: "#FF5722",
            textTransform: 'none',
            boxShadow: 'none'
          }}>Add Report</Button>
        </div>
      </div>
      <Gantt
        tasks={tasks}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? "155px" : ""}
        columnWidth={columnWidth}
      />

      {showSummaryComponent && 
      <div className='task-summary'>
        <GanttTaskSummary task={selectedTask}/>
      </div>
      }
    </div>
  )
}

export default GanttChart