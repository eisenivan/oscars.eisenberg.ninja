import React from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../services/auth'
import PageHeading from '../components/PageHeading'

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

function SignUp () {
  return (
    <div className={`w-full mt-2 max-w-xs m-auto bg-blue-100 border-blue-700 p-5 border-8 rounded-sm border-opacity-10 shadow-sm`}>
      <header className='mx-auto text-center mb-5'>
        <PageHeading>Create an Account</PageHeading>
      </header>

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
          <p className='text-xs text-center'>Already have an account?</p>
          <Link to='/login' className='block text-center mx-auto text-xs underline'>Login?</Link>
        </div>
      </form>
    </div>
  )
}

export default SignUp
