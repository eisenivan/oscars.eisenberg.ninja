import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../services/auth'
import { keyFromName, isSelected } from '../helpers'

function AdminScreen () {
  const { id } = useParams()
  const [locked, setLocked] = useState(true)
  const [categories, setCategories] = useState([])
  const [results, setResults] = useState([])

  function updateLocked (e) {
    const value = e.target.checked
    try {
      db.ref(`settings/${id}/locked`).set(!!value).then(() => {
        setLocked(value)
      })
    } catch (e) {
      console.warn(e)
    }
  }

  useEffect(() => {
    db.ref('/groups/2021')
      .once('value')
      .then((snapshot) => {
        setCategories(snapshot.val())
      })
  }, [])

  useEffect(() => {
    db.ref(`/settings/${id}`)
      .on('value', (snapshot) => {
        setLocked(snapshot.val().locked)
        setResults(snapshot.val().results || [])
      })
  }, [id])

  function updateResults (e) {
    const value = e.target.value
    const tempResults = [...results]
    const category = value.split('__')[0]
    const index = tempResults.findIndex((x) => x.indexOf(category) > -1)

    if (index === -1) {
      tempResults.push(value)
    } else {
      tempResults[index] = value
    }

    try {
      db.ref(`settings/${id}/results`).set(tempResults).then(() => {
        setResults(tempResults)
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      <label className={`border-solid block pl-2 mb-6`} htmlFor='locked'>
        <input className='mr-2' onChange={updateLocked} type='checkbox' checked={locked} id='locked' />
        <span className=''>Close voting</span>
      </label>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
        {
          categories.map((cat) => {
            let resultClass = ''
            let resultSymbol = ''

            return (
              <div className={`mb-6`} key={cat.id}>
                <h2 className='text-xl lg:text-2xl mb-2'>{cat.name} <i className={resultClass}>{resultSymbol}</i></h2>
                { cat.candidates.map(candidate => {
                  const key = `${cat.id}__${keyFromName(candidate.text)}`
                  return (
                    <label className={`border-solid block pl-2 ml-2 border-l`} key={key} htmlFor={key}>
                      <input checked={isSelected(results, key)} onChange={updateResults} className='mr-2' type='radio' name={cat.id} value={key} id={key} />
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

export default AdminScreen
