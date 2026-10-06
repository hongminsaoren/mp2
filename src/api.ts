import axios from 'axios'
import type { Pokemon } from './types'

const api = axios.create({ baseURL: 'https://pokeapi.co/api/v2' })

type ApiPokemon = {
  id: number
  name: string
  height: number
  weight: number
  sprites: { other: { 'official-artwork': { front_default: string | null } }; front_default: string | null }
  types: { type: { name: string } }[]
  abilities: { ability: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
}

function formatPokemon(data: ApiPokemon): Pokemon {
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default || '',
    types: data.types.map((item) => item.type.name),
    abilities: data.abilities.map((item) => item.ability.name),
    stats: data.stats.map((item) => ({ name: item.stat.name, value: item.base_stat })),
  }
}

export async function getPokemonList(): Promise<Pokemon[]> {
  const list = await api.get<{ results: { url: string }[] }>('/pokemon?limit=36')
  const responses = await Promise.all(list.data.results.map((item) => axios.get<ApiPokemon>(item.url)))
  return responses.map((response) => formatPokemon(response.data))
}

export async function getPokemon(id: string): Promise<Pokemon> {
  const response = await api.get<ApiPokemon>(`/pokemon/${id}`)
  return formatPokemon(response.data)
}
