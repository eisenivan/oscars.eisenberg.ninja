import React, { useContext } from 'react'
import firebase from 'firebase'

const firebaseConfig = {
  apiKey: 'AIzaSyCTs_zk_v9jtFhVXCjUAYJBKfWjf5LMOZU',
  authDomain: 'eisenberg-oscars.firebaseapp.com',
  projectId: 'eisenberg-oscars',
  storageBucket: 'eisenberg-oscars.appspot.com',
  messagingSenderId: '438075122494',
  appId: '1:438075122494:web:ffe656c3d5cf001095c26f'
}

firebase.initializeApp(firebaseConfig)
export const auth = firebase.auth
export const db = firebase.database()

export const userContext = React.createContext({
  user: null
})

export const useSession = () => {
  const { user } = useContext(userContext)
  return user
}

export const useAuth = () => {
  const [state, setState] = React.useState(() => {
    const user = firebase.auth().currentUser
    return {
      initializing: !user,
      user
    }
  })

  function onChange (user) {
    setState({ initializing: false, user })
  }

  React.useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebase.auth().onAuthStateChanged(onChange)

    // unsubscribe to the listener when unmounting
    return () => unsubscribe()
  }, [])

  return state
}
