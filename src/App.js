import { useAuth, userContext } from './services/auth'
import Login from './screens/Login'
import Profile from './screens/Profile'
import Home from './screens/Home'
import About from './screens/About'
import Chrome from './components/Chrome'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import './App.css'

function App () {
  const { initializing, user } = useAuth()

  if (initializing) {
    return (
      <Router>
        <Chrome>
          Loading...
        </Chrome>
      </Router>
    )
  }

  if (!user) {
    return (
      <Router>
        <Switch>
          <Route path='/about'>
            <Chrome>
              <About />
            </Chrome>
          </Route>
          <Route path='/login'>
            <Chrome>
              <Login />
            </Chrome>
          </Route>
          <Route path='/'>
            <Chrome>
              <Home />
            </Chrome>
          </Route>
        </Switch>
      </Router>
    )
  }

  return (
    <userContext.Provider value={{ user }}>
      <Router>
        <Switch>
          <Route path='/about'>
            <Chrome>
              <About />
            </Chrome>
          </Route>
          <Route path='/profile'>
            <Chrome>
              <Profile />
            </Chrome>
          </Route>
          <Route path='/login'>
            <Chrome>
              <Login />
            </Chrome>
          </Route>
          <Route path='/'>
            <Chrome>
              <Home />
            </Chrome>
          </Route>
        </Switch>
      </Router>
    </userContext.Provider>
  )
}

export default App
