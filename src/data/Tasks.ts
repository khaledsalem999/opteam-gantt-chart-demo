import { Task } from 'gantt-task-react';


//This data should originally come from an API service so let us assume thats the case here just for the sake of the task
//Also important to note that these data basically are outside of react engine's state upater so changes here needs a reset unless it's done from a react component

const currentDate = new Date();
const Tasks: Task[] = [
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    name: "Construction",
    id: "ProjectSample",
    progress: 25,
    type: "project",
    hideChildren: false,
    displayOrder: 1,
    description: "Hello World",
    progressReport: [
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        reportProgress: 10,
        isReportStatusPostive: true,
        reportComment: "Progress going fine and on time"
      },
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7),
        reportProgress: 30,
        isReportStatusPostive: true,
        reportComment: "Progress going fine and with very small hiccups"
      },
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        reportProgress: 40,
        isReportStatusPostive: false,
        reportComment: "Owner Delayed"
      }
    ]
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      2,
      12,
      28
    ),
    name: "Setup",
    id: "Task 0",
    progress: 45,
    type: "task",
    project: "ProjectSample",
    displayOrder: 2,
    description: "Hello World",
    progressReport: [
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        reportProgress: 15,
        isReportStatusPostive: false,
        reportComment: "On-site accident"
      },
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        reportProgress: 15,
        isReportStatusPostive: true,
        reportComment: "Progress going fine"
      },
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        reportProgress: 10,
        isReportStatusPostive: false,
        reportComment: "Missing equipments"
      },
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11),
        reportProgress: 5,
        isReportStatusPostive: true,
        reportComment: "Equipments Obtained"
      }
    ]
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
    name: "Digging",
    id: "Task 1",
    progress: 25,
    dependencies: ["Task 0"],
    type: "task",
    project: "ProjectSample",
    displayOrder: 3,
    description: "Hello World",
    progressReport: [
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
        reportProgress: 10,
        isReportStatusPostive: false,
        reportComment: "Equipment needed some maintance first"
      },
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 3),
        reportProgress: 15,
        isReportStatusPostive: true,
        reportComment: "Completely dug out the required space"
      }
    ]
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
    name: "Cement Filling",
    id: "Task 2",
    progress: 10,
    dependencies: ["Task 1"],
    type: "task",
    project: "ProjectSample",
    displayOrder: 4,
    description: "Hello World",
    progressReport: [
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7),
        reportProgress: 10,
        isReportStatusPostive: true,
        reportComment: "Cement filling is going fine and on time"
      }
    ]
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9, 0, 0),
    name: "Developing",
    id: "Task 3",
    progress: 2,
    dependencies: ["Task 2"],
    type: "task",
    project: "ProjectSample",
    displayOrder: 5,
    description: "Hello World",
    progressReport: [
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        reportProgress: 10,
        isReportStatusPostive: false,
        reportComment: "Rain preventing from completeing on time"
      },
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7),
        reportProgress: 30,
        isReportStatusPostive: false,
        reportComment: "Some building materials were damaged"
      },
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        reportProgress: 30,
        isReportStatusPostive: false,
        reportComment: "Owner Didn't like some of the work done"
      }
    ]
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
    name: "Bases",
    id: "Task 4",
    type: "task",
    progress: 70,
    dependencies: ["Task 2"],
    project: "ProjectSample",
    displayOrder: 6,
    description: "Hello World",
    progressReport: [
      {
        reportStartDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        reportEndDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        reportProgress: 10,
        isReportStatusPostive: true,
        reportComment: "Bases has been installed successfully"
      }
    ]
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    name: "Review",
    id: "Task 6",
    progress: currentDate.getMonth(),
    type: "milestone",
    dependencies: ["Task 4"],
    project: "ProjectSample",
    displayOrder: 7,
    description: "Hello World",
    progressReport: []
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
    name: "Party Time",
    id: "Task 9",
    progress: 0,
    isDisabled: true,
    type: "task",
    description: "Hello World",
    progressReport: []
  },
]

export default Tasks;