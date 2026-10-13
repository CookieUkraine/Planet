import React, { useState } from 'react'
import './planet.css'
const Buttons = ({count, increase, decrease, reset }) => {

  return (
    <div className='buttons-container'>
      <h2 className='buttons-title'>Asteroid controls</h2>
      <p id='counter'>Asteroids number: {count}</p>
      <div className='buttons'>
        <button onClick={increase}>+</button>
        <button onClick={decrease}>-</button>
        <button onClick={reset}>reset</button>
      </div>
    </div>
  )
}

export default Buttons