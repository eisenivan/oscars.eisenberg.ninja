import React, { useState } from 'react'
import { auth } from '../services/auth'
import Loader from '../components/Loader'
import PageHeading from '../components/PageHeading'

async function updateProfile (e, user, setLoading) {
  e.preventDefault()
  setLoading(true)
  const { displayName, email } = e.target.elements
  await user.updateProfile({
    displayName: displayName.value
  })

  await user.updateEmail(email.value)
  window.location.href = '/'
  setLoading(false)
}

async function sendPasswordResetEmail (user) {
  await auth().sendPasswordResetEmail(user.email)
  window.alert('Check your email')
}

function App () {
  const user = auth().currentUser
  const [loading, setLoading] = useState(false)

  if (!user.displayName) {
    user.updateProfile({
      displayName: user.email
    })
  }

  return (
    <div className={`w-full mt-2 max-w-sm m-auto bg-blue-100 p-5 border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm`}>
      <header>
        <div className='mx-auto text-center mb-5'>
          <PageHeading>Your Profile</PageHeading>
        </div>
      </header>
      <form onSubmit={(e) => updateProfile(e, user, setLoading)}>
        <div>
          <label className={`block text-blue-500`} htmlFor='email'>Display Name</label>
          <div className='text-xs mb-2 text-black-100 italic'>This will be the name that shows up on the leaderboard. Change this to your name.</div>
          <input defaultValue={user.displayName} className={`w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300`} type='text' name='displayName' />
        </div>
        <div>
          <label className={`block mb-2 text-blue-500`} htmlFor='email'>Email</label>
          <input defaultValue={user.email} className={`w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300`} type='text' name='email' />
        </div>
        <div>
          <button type='submit' className={`block text-center bg-blue-700 hover:bg-indigo-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto w-max-md`}>{ loading ? <Loader color='#FFF' style={{ height: '20px' }} /> : 'Update Profile' }</button>
        </div>
      </form>

      <div>
        <button type='button' onClick={() => sendPasswordResetEmail(user)} className={`block hover:text-indigo-500 text-blue-500 font-bold py-2 px-4 mb-6 mx-auto`}>Reset Password?</button>
      </div>
    </div>
  )
}

export default App
