import React, { useEffect, useState } from 'react'
import { db } from '../services/auth'

function Scoreboard () {
  // const user = useSession() || {}
  const [ballots, setBallots] = useState({})
  const [results, setResults] = useState([])

  useEffect(() => {
    db.ref(`/ballots/2021`)
      .once('value')
      .then((snapshot) => {
        setBallots(snapshot.val() || {})
      })
  }, [])

  useEffect(() => {
    db.ref(`/ballots/2021`)
      .on('value', (snapshot) => {
        setBallots(snapshot.val() || {})
      })
  }, [])

  useEffect(() => {
    db.ref('/settings/2021')
      .on('value', (snapshot) => {
        setResults(snapshot.val().results)
      })
  }, [])
  console.log(ballots)

  let tempScores = []
  if (ballots) {
    Object.keys(ballots).forEach((key) => {
      tempScores[key] = 0
      results.forEach((winner) => {
        if (ballots[key].votes.indexOf(winner) > -1) {
          tempScores[key] = tempScores[key] + 1
        }
      })
    })

    return (
      <div>
        {
          Object.keys(ballots).map((key) => {
            return (
              <div>
                <div>{ballots[key].displayName}: {tempScores[key]} / {results.length}</div>
              </div>
            )
          })
        }
      </div>
    )
  }

  return (
    <div>Loading...</div>
  )
}

export default Scoreboard
