import React, { useEffect, useState } from 'react'
import _sortBy from 'lodash.sortby'
import { db, useSession } from '../services/auth'
import Loader from '../components/Loader'
import PageHeading from '../components/PageHeading'

function dynamicColor (index) {
  switch (index) {
    case 0:
      return 'bg-blue-600'

    case 1:
      return 'bg-blue-500'

    case 2:
      return 'bg-blue-400'

    case 3:
      return 'bg-blue-300'

    case 4:
      return 'bg-blue-300'

    case 5:
      return 'bg-blue-200'

    default:
      return 'bg-blue-100'
  }
}

function Scoreboard () {
  const user = useSession() || {}
  const [ballots, setBallots] = useState({})
  const [results, setResults] = useState([])
  const [masterBallot, setMasterBallot] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.ref(`/groups/2021`)
      .once('value')
      .then((snapshot) => {
        setMasterBallot(snapshot.val() || {})
      })
  }, [])

  useEffect(() => {
    db.ref(`/ballots/2021`)
      .on('value', (snapshot) => {
        setBallots(snapshot.val() || {})
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    db.ref('/settings/2021')
      .on('value', (snapshot) => {
        setResults(snapshot.val().results)
      })
  }, [])

  if (!loading) {
    Object.keys(ballots).forEach((key) => {
      ballots[key].score = 0
      results.forEach((winner) => {
        if (ballots[key].votes.indexOf(winner) > -1) {
          ballots[key].score = ballots[key].score + 1
        }
      })
    })

    const ballotArray = Object.keys(ballots)
      .map(key => ballots[key])

    const sortedBallots = _sortBy(ballotArray, ['score', 'displayName']).reverse()

    // Set ranks
    const rankedSortedBallots = sortedBallots.reduce((acc, x, i) => {
      let rank = i + 1
      const lastBallot = acc[acc.length - 1]

      if (lastBallot && x.score === lastBallot.score) {
        rank = lastBallot.rank
      }
      return ([...acc, { ...x, rank }])
    }, [])

    return (
      <>
        <div className='mx-auto max-w-lg text-center'>
          <PageHeading>Leaderboard</PageHeading>
          <p className='text-xs mb-2'>{results.length} of {Object.keys(masterBallot).length} categories announced</p>
        </div>
        <div className='max-w-lg mx-auto border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm'>
          {
            rankedSortedBallots.map((x, place) => {
              return (
                <div key={x.displayName} className={`grid grid-cols-leaderboard gap-x-2 p-2 ${dynamicColor(x.rank)} ${user.displayName === x.displayName ? 'transform scale-105 shadow-lg' : ''}`}>
                  <div className='bg-white rounded-full p-0.5 rotate-12 font-black text-center'>#{x.rank}</div>
                  <div className={`flex items-center ${user.displayName === x.displayName ? 'font-bold italic' : ''}`}>{x.displayName}</div>
                  <div className='flex items-center font-black text-right'>{x.score}</div>
                </div>
              )
            })
          }
        </div>
      </>
    )
  }

  return (
    <Loader />
  )
}

export default Scoreboard
