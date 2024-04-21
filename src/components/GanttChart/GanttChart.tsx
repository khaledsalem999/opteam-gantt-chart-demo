import { useState, useEffect, useRef} from 'react'
import { Gantt, Task} from 'gantt-task-react';
import Tasks from '../../data/Tasks';
import GanttTaskSummary from './GanttTaskSummary';
import './GanttChart.css'
import GanttHeader from './GanttHeader';

const progressCompletionColor = "#7CFC00";
const progressSelectedCompletetionColor = "#228B22";

const inProgressColor = "#A3A3FF";
const inProgressSelectColor = "#8282F5";

function GanttChart() {

  const [tasks, setTasks] = useState<Task[]>(Tasks);
  const [showSummaryComponent, setShowSummaryComponent] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task>(Object);
  const [isChecked] = useState(true);
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
    if (task.progress === 100) {
      task.styles = {
        progressColor: progressCompletionColor,
        progressSelectedColor: progressSelectedCompletetionColor
      }
    } else {
      task.styles = {
        progressColor: inProgressColor,
        progressSelectedColor: inProgressSelectColor
      }
    }
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    setSelectedTask(task);
  };

  const handleDblClick = (task: Task) => {
    //do logic if needed
  };

  const handleClick = (task: Task) => {
    if (task.id === selectedTask.id && showSummaryComponent) {
      setShowSummaryComponent(false);
    } else if (task.id === selectedTask.id && !showSummaryComponent) {
      setShowSummaryComponent(true);
    } else if (task.id !== selectedTask.id && !showSummaryComponent) {
      setShowSummaryComponent(true);
    }
    setSelectedTask(task);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    //do logic if needed
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
  };


  return (
    <div className='wrapper border' ref={componentRef}>
      <GanttHeader/>
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
          <GanttTaskSummary task={selectedTask} />
        </div>
      }
    </div>
  )
}

export default GanttChart