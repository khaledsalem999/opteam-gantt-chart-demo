import React from 'react'
import { Task } from 'gantt-task-react';

interface DisplayComponentProps {
    task: Task;
}

const Summary: React.FC<DisplayComponentProps> = ({ task }) => {

    function progressStatus() {
        if (task.progress !== 100 && task.progress !== 0) {
            console.log(task.progress);
            return "In progress";
        } else if (task.progress === 100) {
            return "Completed";
        } else if (task.progress === 0) {
            return "Not Started";
        } else {
            return "Not started";
        }
    }

    return (
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
    )
}

export default Summary