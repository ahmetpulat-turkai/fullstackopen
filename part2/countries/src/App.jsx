import { useState, useEffect } from 'react'
import axios from 'axios'

const CountryDetails = ({ country }) => (
  <div>
    <h1>{country.name.common}</h1>
    <div>capital {country.capital && country.capital.join(', ')}</div>
    <div>area {country.area}</div>
    <h3>languages</h3>
    <ul>
      {Object.values(country.languages || {}).map((lang) => (
        <li key={lang}>{lang}</li>
      ))}
    </ul>
    <img src={country.flags.png} alt={`flag of ${country.name.common}`} width="150" />
  </div>
)

const App = () => {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then((response) => setCountries(response.data))
  }, [])

  const handleChange = (event) => {
    setQuery(event.target.value)
    setSelected(null)
  }

  const matches = countries.filter((c) =>
    c.name.common.toLowerCase().includes(query.toLowerCase())
  )

  let content = null
  if (query === '') {
    content = null
  } else if (selected) {
    content = <CountryDetails country={selected} />
  } else if (matches.length > 10) {
    content = <p>Too many matches, specify another filter</p>
  } else if (matches.length > 1) {
    content = (
      <div>
        {matches.map((c) => (
          <div key={c.cca3}>
            {c.name.common} <button onClick={() => setSelected(c)}>show</button>
          </div>
        ))}
      </div>
    )
  } else if (matches.length === 1) {
    content = <CountryDetails country={matches[0]} />
  } else {
    content = <p>No matches</p>
  }

  return (
    <div>
      find countries <input value={query} onChange={handleChange} />
      {content}
    </div>
  )
}

export default App
