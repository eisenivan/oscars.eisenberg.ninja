import React from 'react'

function Loader (props) {
  const color = props.color || '#444'
  return (
    <svg className='mx-auto' style={{ width: '100px', height: '100px' }} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' {...props}>
      <circle
        fill='none'
        stroke={color}
        strokeWidth={4}
        strokeMiterlimit={10}
        cx={50}
        cy={50}
        r={48}
      />
      <path
        fill='none'
        strokeLinecap='round'
        stroke={color}
        strokeWidth={4}
        strokeMiterlimit={10}
        d='M50 50l35 .5'
      >
        <animateTransform
          attributeName='transform'
          dur='2s'
          type='rotate'
          from='0 50 50'
          to='360 50 50'
          repeatCount='indefinite'
        />
      </path>
      <path
        fill='none'
        strokeLinecap='round'
        stroke={color}
        strokeWidth={4}
        strokeMiterlimit={10}
        d='M50 50l-.5 24'
      >
        <animateTransform
          attributeName='transform'
          dur='15s'
          type='rotate'
          from='0 50 50'
          to='360 50 50'
          repeatCount='indefinite'
        />
      </path>
    </svg>
  )
}

export default Loader
