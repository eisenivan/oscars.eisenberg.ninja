import React, { useEffect, useState } from 'react'
// import categories from '../categories.json'
import { accentColor } from '../variables'
import { db, useSession } from '../services/auth'

function keyFromName (name) {
  return name
    .toLowerCase()
    .replace(/\s/g, '')
}

function isSelected (ballot, value) {
  return ballot.indexOf(value) > -1
}

function Home () {
  const user = useSession() || {}
  const [categories, setCategories] = useState([])
  const [ballot, setBallot] = useState([])
  const [locked, setLocked] = useState(true)
  const [results, setResults] = useState([])
  const [score, setScore] = useState(0)
  useEffect(() => {
    db.ref('/groups/2021')
      .once('value')
      .then((snapshot) => {
        setCategories(snapshot.val())
      })
  }, [])

  useEffect(() => {
    db.ref('/settings/2021/locked')
      .on('value', (snapshot) => {
        setLocked(snapshot.val())
      })
  }, [])

  useEffect(() => {
    db.ref('/settings/2021/results')
      .on('value', (snapshot) => {
        setResults(snapshot.val())
      })
  }, [])

  useEffect(() => {
    db.ref(`/scores/2021/${user.uid}`)
      .once('value')
      .then((snapshot) => {
        setScore(snapshot.val())
      })
  }, [user.uid])

  useEffect(() => {
    db.ref(`/ballots/2021/${user.uid}`)
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

    console.log(index)
    if (index === -1) {
      tempBallot.push(value)
    } else {
      tempBallot[index] = value
    }

    db.ref(`ballots/2021/${user.uid}`).set(tempBallot).then(() => {
      setBallot(tempBallot)
    })
  }

  return (
    <div>
      <span>Score: {score}/{results.length}</span>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
        {
          categories.map((cat) => {
            let resultClass = 'hidden'
            let resultSymbol = ''

            if (locked) {
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
                <h2 className='text-xl lg:text-2xl mb-2'>{cat.name} <i className={resultClass}>{resultSymbol}</i></h2>
                { cat.candidates.map(candidate => {
                  const key = `${cat.id}__${keyFromName(candidate.text)}`
                  return (
                    <label className={`border-solid block pl-2 ml-2 border-l border-${accentColor}-200`} key={key} htmlFor={key}>
                      <input disabled={locked} onChange={updateBallot} checked={isSelected(ballot, key)} className='mr-2' type='radio' name={cat.id} value={key} id={key} />
                      <span className=''>{candidate.text}</span>
                      { candidate.subtext ? <span className='block ml-6 pb-2 font-thin text-xs italic'>{candidate.subtext}</span> : null }
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

export default Home
