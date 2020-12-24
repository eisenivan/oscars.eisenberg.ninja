import React from 'react'
import { auth } from '../services/auth'
import { mainColor } from '../variables'

async function login (e) {
  e.preventDefault()
  const { email, password } = e.target.elements
  try {
    await auth().signInWithEmailAndPassword(email.value, password.value)
    window.location.href = '/'
  } catch (error) {
    console.warm(error)
  }
}

function App () {
  return (
    <div className={`w-full mt-2 max-w-xs m-auto bg-${mainColor}-100 rounded p-5`}>
      <header>
        <img alt='tiger icon' className='w-20 mx-auto mb-5' src='https://img.icons8.com/fluent/344/year-of-tiger.png' />
      </header>
      <form onSubmit={login}>
        <div>
          <label className={`block mb-2 text-${mainColor}-500`} htmlFor='email'>Email</label>
          <input className={`w-full p-2 mb-6 text-${mainColor}-700 border-b-2 border-${mainColor}-500 outline-none focus:bg-gray-300`} type='text' name='email' />
        </div>
        <div>
          <label className={`block mb-2 text-${mainColor}-500`} htmlFor='password'>Password</label>
          <input className={`w-full p-2 mb-6 text-${mainColor}-700 border-b-2 border-${mainColor}-500 outline-none focus:bg-gray-300`} type='password' name='password' />
        </div>
        <div>
          <button type='submit' className={`block text-center bg-${mainColor}-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto`}>Login</button>
        </div>
      </form>
    </div>
  )
}

export default App
