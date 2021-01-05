import { useAuth, userContext } from './services/auth'
import Login from './screens/Login'
import SignUp from './screens/SignUp'
import Profile from './screens/Profile'
import Ballot from './screens/Ballot'
import ScoreBoard from './screens/Scoreboard'
import Admin from './screens/Admin'
import Chrome from './components/Chrome'
import Loader from './components/Loader'
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
          <Loader />
        </Chrome>
      </Router>
    )
  }

  if (!user) {
    return (
      <Router>
        <Switch>
          <Route path='/login'>
            <Chrome>
              <Login />
            </Chrome>
          </Route>
          <Route path='/register'>
            <Chrome>
              <SignUp />
            </Chrome>
          </Route>
          <Route path='/'>
            <Chrome>
              <SignUp />
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
          <Route path='/scoreboard'>
            <Chrome>
              <ScoreBoard />
            </Chrome>
          </Route>
          <Route path='/admin/:id'>
            <Chrome>
              <Admin />
            </Chrome>
          </Route>
          <Route exact path='/'>
            <Chrome>
              <Ballot />
            </Chrome>
          </Route>
        </Switch>
      </Router>
    </userContext.Provider>
  )
}

export default App
