import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPokemon } from './api'
import type { Pokemon } from './types'

export default function DetailPage({ pokemon }: { pokemon: Pokemon[] }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<Pokemon | null>(pokemon.find((entry) => String(entry.id) === id) || null)
  const [error, setError] = useState('')
  useEffect(() => {
    const found = pokemon.find((entry) => String(entry.id) === id)
    if (found) { setItem(found); setError(''); return }
    setItem(null)
    getPokemon(id).then(setItem).catch(() => setError('Pokémon not found.'))
  }, [id, pokemon])
  if (error) return <main className="page"><p className="status error">{error}</p><Link to="/list">Back to list</Link></main>
  if (!item) return <main className="page"><p className="status">Loading details…</p></main>
  const index = pokemon.findIndex((entry) => entry.id === item.id)
  const previous = index >= 0 ? pokemon[(index - 1 + pokemon.length) % pokemon.length].id : Math.max(1, item.id - 1)
  const next = index >= 0 ? pokemon[(index + 1) % pokemon.length].id : item.id + 1
  return (
    <main className="page detail-page">
      <Link className="back" to="/list">← Back to list</Link>
      <section className="detail-card">
        <img src={item.image} alt={item.name} />
        <div><p className="number">#{String(item.id).padStart(3, '0')}</p><h1>{item.name}</h1><dl><dt>Type</dt><dd>{item.types.join(', ')}</dd><dt>Height</dt><dd>{item.height / 10} m</dd><dt>Weight</dt><dd>{item.weight / 10} kg</dd><dt>Abilities</dt><dd>{item.abilities.join(', ')}</dd></dl><h2>Base stats</h2><ul className="stats">{item.stats.map((stat) => <li key={stat.name}><span>{stat.name}</span><strong>{stat.value}</strong></li>)}</ul></div>
      </section>
      <div className="detail-nav"><button type="button" onClick={() => navigate(`/pokemon/${previous}`)}>← Previous</button><button type="button" onClick={() => navigate(`/pokemon/${next}`)}>Next →</button></div>
    </main>
  )
}
