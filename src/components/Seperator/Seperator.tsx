import React from 'react'
import './Seperator.css'

function Seperator() {
  return (
    <div className='d-flex flex-row justify-content-between'>
        <div>
            <span>Projects</span>
            <span> / </span>
            <span className='fw-bold'>Construction Plans</span>
        </div>
        <div>
            <span className='fw-bold'>Progress summary: </span>
            <span className='fw-bold plan-status-color-positive'>According to plan</span>
        </div>
    </div>
  )
}

export default Seperator