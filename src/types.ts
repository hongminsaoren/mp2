export type Pokemon = {
  id: number
  name: string
  height: number
  weight: number
  image: string
  types: string[]
  abilities: string[]
  stats: { name: string; value: number }[]
}
