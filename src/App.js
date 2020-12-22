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
  return (
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
  )
}

export default App
