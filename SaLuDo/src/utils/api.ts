import { Data } from '../types/data'

export async function fetchApiData(): Promise<Data | null> {
  const response = await fetch('http://localhost:3000/api/data')
  if (!response.ok) return null
  return response.json()
}
export const apiUrl: string = 'http://localhost:3000/api/'