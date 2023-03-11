import React, { useEffect, useState } from 'react'
import Loader from '../components/Loader'
import PageHeading from '../components/PageHeading'
import { db, useSession } from '../services/auth'
import { keyFromName, isSelected } from '../helpers'
import { YEAR } from '../constants'

function Ballot () {
  const user = useSession() || {}
  const [categories, setCategories] = useState([])
  const [ballot, setBallot] = useState([])
  const [locked, setLocked] = useState(false)
  let [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.ref(`/groups/${YEAR}`)
      .once('value')
      .then((snapshot) => {
        setCategories(snapshot.val())
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    db.ref(`/settings/${YEAR}`)
      .on('value', (snapshot) => {
        setLocked(snapshot.val().locked)

        if (snapshot.val().results) {
          setResults(snapshot.val().results)
        } else {
          setResults([])
        }
      })
  }, [])

  useEffect(() => {
    db.ref(`/ballots/${YEAR}/${user.uid}/votes`)
      .once('value')
      .then((snapshot) => {
        setBallot(snapshot.val() || [])
      })
  }, [user.uid])

  function updateBallot (e) {
    const value = e.target.value
    const tempBallot = [...ballot]
    const category = value.split('__')[0]
    const index = tempBallot.findIndex((x) => x.indexOf(category) > -1)

    if (index === -1) {
      tempBallot.push(value)
    } else {
      tempBallot[index] = value
    }

    db.ref(`ballots/${YEAR}/${user.uid}`).set({ displayName: user.displayName, votes: tempBallot }).then(() => {
      setBallot(tempBallot)
    })
  }

  let tempScore = 0
  if (ballot.length > 0 && results.length > 0) {
    results.forEach((winner) => {
      if (ballot.indexOf(winner) > -1) {
        tempScore = tempScore + 1
      }
    })
  }

  if (!loading) {
    return (
      <div>
        <PageHeading>
          My Ballot
          { locked && results ? (
            <span className='ml-2 text-sm'>Score: {tempScore}/{results.length}</span>
          ) : null }
        </PageHeading>

        <div className='mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm p-4 bg-blue-100'>
          {
            categories.map((cat) => {
              let resultClass = ''
              let resultSymbol = ''

              if (locked && results) {
                const winner = results.find(x => x.indexOf(cat.id) > -1)
                const won = ballot.indexOf(winner) > -1
                if (winner) {
                  if (won) {
                    resultClass = 'text-green-600'
                    resultSymbol = '✓'
                  } else {
                    resultClass = 'text-red-600'
                    resultSymbol = '✕'
                  }
                }
              }

              return (
                <div className={`mb-6`} key={cat.id}>
                  <h2 className='text-md font-semibold mb-2 uppercase'>{cat.name} <i className={resultClass}>{resultSymbol}</i></h2>
                  { cat.candidates.map(candidate => {
                    const key = `${cat.id}__${keyFromName(candidate.text)}`
                    return (
                      <label className={`border-solid block pl-2 ml-2 border-l border-indigo-200 ${results.indexOf(key) > -1 ? resultClass : ''}`} key={key} htmlFor={key}>
                        <input disabled={locked} onChange={updateBallot} checked={isSelected(ballot, key)} className='mr-2' type='radio' name={cat.id} value={key} id={key} />
                        <span className='uppercase'>{candidate.text}</span>
                        { candidate.subtext ? <span className='block ml-6 pb-2 font-light text-xs italic'>{candidate.subtext}</span> : null }
                      </label>
                    )
                  }) }
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  return (<Loader />)
}

export default Ballot
