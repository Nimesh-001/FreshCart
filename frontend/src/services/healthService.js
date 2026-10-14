import api from '../api/client'

export const healthService = {
  async checkDatabaseHealth() {
    return await api.get('/health/db')
  },
}

export default healthService
