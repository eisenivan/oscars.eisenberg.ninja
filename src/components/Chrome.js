import React from 'react'
import { Link } from 'react-router-dom'
import { mainColor } from '../variables'

export default function Chrome ({ children }) {
  return (
    <>
      <nav className={`relative flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-${mainColor}-500 sm:mb-2 md:mb-6`}>
        <div className='container mx-auto flex flex-wrap items-center justify-between'>
          <div className='w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start'>
            <Link className='text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-no-wrap uppercase text-white' to='/'>
              oscars.eisenberg.ninja
            </Link>
            <button className='cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none' type='button'>
              <span className='block relative w-6 h-px rounded-sm bg-white' />
              <span className='block relative w-6 h-px rounded-sm bg-white mt-1' />
              <span className='block relative w-6 h-px rounded-sm bg-white mt-1' />
            </button>
          </div>
          <div className='lg:flex flex-grow items-center' id='example-navbar-warning'>
            <ul className='flex flex-col lg:flex-row list-none ml-auto'>
              <li className='nav-item'>
                <Link className='px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75' to='/about'>
                About
                </Link>
              </li>
              <li className='nav-item'>
                <Link className='px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75' to='/profile'>
                Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class='container mx-auto px-4'>
        {children}
      </div>
    </>
  )
}
