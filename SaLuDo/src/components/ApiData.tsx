import React from 'react'
import { Data } from '../types/data'

const ApiData: React.FC<{ data: Data | null }> = ({ data }) => (
  data ? <h2>{data.message}</h2> : <h2>Loading...</h2>
)

export default ApiData