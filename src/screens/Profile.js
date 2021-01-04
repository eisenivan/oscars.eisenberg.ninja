import React from 'react'
import { auth } from '../services/auth'

async function updateProfile (e, user) {
  e.preventDefault()
  const { displayName, email } = e.target.elements
  user.updateProfile({
    displayName: displayName.value
  })

  user.updateEmail(email.value)
}

async function sendPasswordResetEmail (user) {
  await auth().sendPasswordResetEmail(user.email)
  window.alert('Check your email')
}

function App () {
  const user = auth().currentUser
  return (
    <div className={`w-full mt-2 max-w-xs m-auto bg-blue-100 rounded p-5`}>
      <header>
        <img alt='tiger icon' className='w-20 mx-auto mb-5' src='https://img.icons8.com/fluent/344/year-of-tiger.png' />
      </header>
      <form onSubmit={(e) => updateProfile(e, user)}>
        <div>
          <label className={`block mb-2 text-blue-500`} htmlFor='email'>Display Name</label>
          <input defaultValue={user.displayName} className={`w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300`} type='text' name='displayName' />
        </div>
        <div>
          <label className={`block mb-2 text-blue-500`} htmlFor='email'>Email</label>
          <input defaultValue={user.email} className={`w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300`} type='text' name='email' />
        </div>
        <div>
          <button type='submit' className={`block text-center bg-blue-700 hover:bg-indigo-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto`}>Update Profile</button>
        </div>
      </form>

      <div>
        <button type='button' onClick={() => sendPasswordResetEmail(user)} className={`block hover:text-indigo-500 text-blue-500 font-bold py-2 px-4 mb-6 mx-auto`}>Reset Password?</button>
      </div>
    </div>
  )
}

export default App
