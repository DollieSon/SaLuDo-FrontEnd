import { Data } from '../types/data'

export async function fetchApiData(): Promise<Data | null> {
  const response = await fetch('https://saludo-backend.onrender.com/api/data')
  if (!response.ok) return null
  return response.json()
}
export const apiUrl: string = 'https://saludo-backend.onrender.com/api/'