import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useSession, auth } from '../services/auth'

function NavItem ({ children, to, exact = false }) {
  return (
    <NavLink exact={exact} className='bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75' to={to}>
      {children}
    </NavLink>
  )
}

export default function Chrome ({ children }) {
  const user = useSession() || {}
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className={`relative flex flex-wrap items-center justify-between px-2 navbar-expand-lg bg-blue-700 sm:mb-2 md:mb-6`}>
        <div className='container mx-auto flex flex-wrap items-center justify-between'>
          <div className='w-full relative flex justify-between lg:w-auto lg:px-4 lg:static lg:block lg:justify-start'>
            <Link className='text-sm font-bold leading-relaxed inline-block mr-4 whitespace-no-wrap uppercase text-white' to='/'>
              <h1>oscars // eisenberg // ninja</h1>
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className='cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none' type='button'>
              <span className='block relative w-6 h-px rounded-sm bg-white' />
              <span className='block relative w-6 h-px rounded-sm bg-white mt-1' />
              <span className='block relative w-6 h-px rounded-sm bg-white mt-1' />
            </button>
          </div>
          <div className={`lg:flex flex-grow items-center ${!menuOpen ? 'hidden sm:hidden lg:block' : ''}`} id='example-navbar-warning'>
            <ul className='flex flex-col lg:flex-row list-none ml-auto'>
              { user.email
                ? (
                  <>
                    <li>
                      <NavItem exact to='/'>
                        My Ballot
                      </NavItem>
                    </li>
                    <li>
                      <NavItem exact to='/scoreboard'>
                        Leaderboard
                      </NavItem>
                    </li>
                    <li>
                      <NavItem exact to='/profile'>
                        Profile
                      </NavItem>
                    </li>
                    <li>
                      <button className='bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75' onClick={() => auth().signOut()}>Logout</button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <NavItem to='/login'>Login</NavItem>
                    </li>
                    <li>
                      <NavItem to='/register'>
                        Register
                      </NavItem>
                    </li>
                  </>
                ) }
            </ul>
          </div>
        </div>
      </nav>

      <div className='container mx-auto mt-4 px-4'>
        {children}
      </div>
    </>
  )
}
