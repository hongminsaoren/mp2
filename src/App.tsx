import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { getPokemonList } from './api'
import DetailPage from './DetailPage'
import type { Pokemon } from './types'

type SortKey = 'id' | 'name' | 'height' | 'weight'

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="logo" to="/">Pokémon Index</Link>
        <nav aria-label="Main navigation">
          <NavLink to="/list">List</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
        </nav>
      </div>
    </header>
  )
}

function Status({ loading, error }: { loading: boolean; error: string }) {
  if (loading) return <p className="status">Loading Pokémon…</p>
  if (error) return <p className="status error">{error}</p>
  return null
}

function ListPage({ pokemon, loading, error }: { pokemon: Pokemon[]; loading: boolean; error: string }) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
  const results = useMemo(() => pokemon
    .filter((item) => item.name.includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      const first = a[sortKey]
      const second = b[sortKey]
      const value = typeof first === 'string' ? first.localeCompare(String(second)) : first - Number(second)
      return direction === 'asc' ? value : -value
    }), [pokemon, query, sortKey, direction])

  return (
    <main className="page">
      <h1>Pokémon List</h1>
      <div className="controls">
        <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a name" /></label>
        <label>Sort by<select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}><option value="id">Number</option><option value="name">Name</option><option value="height">Height</option><option value="weight">Weight</option></select></label>
        <label>Order<select value={direction} onChange={(event) => setDirection(event.target.value as 'asc' | 'desc')}><option value="asc">Ascending</option><option value="desc">Descending</option></select></label>
      </div>
      <Status loading={loading} error={error} />
      {!loading && !error && <p className="count">{results.length} results</p>}
      <div className="list">
        {results.map((item) => <Link className="list-row" to={`/pokemon/${item.id}`} key={item.id}><span>#{String(item.id).padStart(3, '0')}</span><strong>{item.name}</strong><span>{item.types.join(', ')}</span><span>Height: {item.height}</span><span>Weight: {item.weight}</span></Link>)}
      </div>
    </main>
  )
}

function GalleryPage({ pokemon, loading, error }: { pokemon: Pokemon[]; loading: boolean; error: string }) {
  const types = useMemo(() => [...new Set(pokemon.flatMap((item) => item.types))].sort(), [pokemon])
  const [selected, setSelected] = useState<string[]>([])
  const visible = selected.length ? pokemon.filter((item) => selected.some((type) => item.types.includes(type))) : pokemon
  function toggle(type: string) {
    setSelected((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type])
  }
  return (
    <main className="page">
      <h1>Pokémon Gallery</h1>
      <fieldset className="filters"><legend>Filter by type</legend>{types.map((type) => <label key={type}><input type="checkbox" checked={selected.includes(type)} onChange={() => toggle(type)} />{type}</label>)}<button type="button" onClick={() => setSelected([])}>Clear</button></fieldset>
      <Status loading={loading} error={error} />
      <div className="gallery-grid">
        {visible.map((item) => <Link className="gallery-card" to={`/pokemon/${item.id}`} key={item.id}><img src={item.image} alt={item.name} /><div><span>#{String(item.id).padStart(3, '0')}</span><h2>{item.name}</h2><p>{item.types.join(' / ')}</p></div></Link>)}
      </div>
    </main>
  )
}

export default function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    getPokemonList().then(setPokemon).catch(() => setError('Could not load Pokémon. Please try again.')).finally(() => setLoading(false))
  }, [])
  return <><Header /><Routes><Route path="/" element={<Navigate to="/list" replace />} /><Route path="/list" element={<ListPage pokemon={pokemon} loading={loading} error={error} />} /><Route path="/gallery" element={<GalleryPage pokemon={pokemon} loading={loading} error={error} />} /><Route path="/pokemon/:id" element={<DetailPage pokemon={pokemon} />} /><Route path="*" element={<Navigate to="/list" replace />} /></Routes></>
}
