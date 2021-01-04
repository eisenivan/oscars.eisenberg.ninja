import React, { useState } from 'react'
import { auth } from '../services/auth'

async function login (e) {
  e.preventDefault()
  const { email, password } = e.target.elements
  try {
    await auth().createUserWithEmailAndPassword(email.value, password.value)
    window.location.href = '/profile'
  } catch (error) {
    console.warn(error)
  }
}

function App () {
  const [isResetting, setIsResetting] = useState(false)
  return (
    <div className={`w-full mt-2 max-w-xs m-auto bg-blue-100 rounded p-5`}>
      <header>
        <img alt='tiger icon' className='w-20 mx-auto mb-5' src='https://img.icons8.com/fluent/344/year-of-tiger.png' />
      </header>
      { !isResetting
        ? (
          <form onSubmit={login}>
            <div>
              <label className={`block mb-2 text-blue-500`} htmlFor='email'>Email</label>
              <input className={`w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300`} type='text' name='email' />
            </div>
            <div>
              <label className={`block mb-2 text-blue-500`} htmlFor='password'>Password</label>
              <input className={`w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300`} type='password' name='password' />
            </div>
            <div>
              <button type='submit' className={`block text-center bg-blue-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto`}>Register</button>
            </div>
            <div>
              <button className='block text-center mx-auto text-sm' onClick={() => setIsResetting(true)}>Login?</button>
            </div>
          </form>
        )
        : null }

    </div>
  )
}

export default App