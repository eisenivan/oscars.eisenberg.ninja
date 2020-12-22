import React from 'react'
import { mainColor } from '../variables'

function App () {
  return (
    <div className={`w-full mt-2 max-w-xs m-auto bg-${mainColor}-100 rounded p-5`}>
      <header>
        <img class='w-20 mx-auto mb-5' src='https://img.icons8.com/fluent/344/year-of-tiger.png' />
      </header>
      <form>
        <div>
          <label class={`block mb-2 text-${mainColor}-500`} for='username'>Username</label>
          <input class={`w-full p-2 mb-6 text-${mainColor}-700 border-b-2 border-${mainColor}-500 outline-none focus:bg-gray-300`} type='text' name='username' />
        </div>
        <div>
          <label class={`block mb-2 text-${mainColor}-500`} for='password'>Password</label>
          <input class={`w-full p-2 mb-6 text-${mainColor}-700 border-b-2 border-${mainColor}-500 outline-none focus:bg-gray-300`} type='password' name='password' />
        </div>
        <div>
          <a href='#' class={`block text-center bg-${mainColor}-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto`}>Login</a>
        </div>
      </form>
    </div>
  )
}

export default App
