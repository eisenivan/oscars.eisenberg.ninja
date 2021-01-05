import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../services/auth'
import PageHeading from '../components/PageHeading'

async function login (e) {
  e.preventDefault()
  const { email, password } = e.target.elements
  try {
    await auth().signInWithEmailAndPassword(email.value, password.value)
    window.location.href = '/'
  } catch (error) {
    console.warn(error)
  }
}

async function resetPassword (e) {
  e.preventDefault()
  const { email } = e.target.elements

  try {
    await auth().sendPasswordResetEmail(email.value)
    window.location.href = '/'
  } catch (error) {
    console.warn(error)
  }
}

function App () {
  const [isResetting, setIsResetting] = useState(false)
  return (
    <div className={`w-full mt-2 max-w-xs m-auto bg-blue-100 p-5 border-blue-700 border-8 rounded-sm border-opacity-10 shadow-md`}>
      <div className='mx-auto text-center mb-5'>
        <PageHeading>Login</PageHeading>
      </div>
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
              <button type='submit' className={`block text-center bg-blue-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto`}>Login</button>
            </div>
            <div className='mb-3'>
              <p className='text-xs italic text-center'>Don't have an account?</p>
              <Link to='/register' className='block text-center mx-auto text-xs underline'>Register</Link>
            </div>
            <div>
              <button className='block text-center mx-auto text-xs underline' onClick={() => setIsResetting(true)}>Forgot Password?</button>
            </div>
          </form>
        )
        : (
          <form onSubmit={resetPassword}>
            <div>
              <label className={`block mb-2 text-blue-500`} htmlFor='email'>Email</label>
              <input className={`w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300`} type='text' name='email' />
            </div>
            <div>
              <button type='submit' className={`block text-center bg-blue-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto`}>Reset Password</button>
            </div>
            <div className='mb-3'>
              <p className='text-xs italic text-center'>Don't have an account?</p>
              <Link to='/register' className='block text-center mx-auto text-xs underline'>Register</Link>
            </div>
            <div>
              <button className='block text-center mx-auto text-xs underline' onClick={() => setIsResetting(false)}>Return to Login</button>
            </div>
          </form>
        )
      }

    </div>
  )
}

export default App
