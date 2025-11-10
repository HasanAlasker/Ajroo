import {apiClient} from './client'

const endPoint = '/api/admin'

export const getStats = () => apiClient.get(`${endPoint}/dashboard/stats`)