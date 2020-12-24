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
  useEffect(() => {
    db.ref('/groups/2021')
      .once('value')
      .then((snapshot) => {
        setCategories(snapshot.val())
      })
  }, [])

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
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
      { categories.map((cat) => (
        <div className='mb-6' key={cat.id}>
          <h2 className='text-xl lg:text-2xl mb-2'>{cat.name}</h2>
          { cat.candidates.map(candidate => (
            <label className={`border-solid block pl-2 ml-2 border-l border-${accentColor}-200`} key={`${cat.id}__${keyFromName(candidate.text)}`} htmlFor={`${cat.id}__${keyFromName(candidate.text)}`}>
              <input onChange={updateBallot} checked={isSelected(ballot, `${cat.id}__${keyFromName(candidate.text)}`)} className='mr-2' type='radio' name={cat.id} value={`${cat.id}__${keyFromName(candidate.text)}`} id={`${cat.id}__${keyFromName(candidate.text)}`} />
              <span className=''>{candidate.text}</span>
              { candidate.subtext ? <span className='block ml-6 pb-2 font-thin text-xs italic'>{candidate.subtext}</span> : null }
            </label>
          )) }

        </div>
      )) }
    </div>
  )
}

export default Home
