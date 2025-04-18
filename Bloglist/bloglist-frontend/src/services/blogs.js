import axios from 'axios'

const baseUrl = '/api/blogs'
const userBaseUrl = '/api/users'

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (id, newObject) => {
  console.log(`${baseUrl}/${id}`)
  const response = await axios.put(`${baseUrl}/${id}`, newObject)
  return response.data
}

const remove = async (id) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.delete(`${baseUrl}/${id}`, config)
  return response
}

const addToUser = async (userId, blogId) => {
  console.log(`${userId}`)
  console.log(`${blogId}`)
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.put(
    `${userBaseUrl}/${userId}`,
    { blogId },
    config
  )
  return response.data
}

const getAllUsers = async () => {
  const response = await axios.get(userBaseUrl)
  return response.data
}

export default {
  getAll,
  create,
  setToken,
  update,
  remove,
  addToUser,
  getAllUsers,
}
