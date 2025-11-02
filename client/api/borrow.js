import { apiClient } from "./client";

const endPoint = "/api/borrows"

export const getAllBorrows = () => apiClient.get(endPoint)

export const getBorrowById = () => apiClient.get(`${endPoint}/${id}`)

export const givenItems = () => apiClient.get(`${endPoint}/given`) // ✅

export const takenItems = () => apiClient.get(`${endPoint}/taken`) // ✅

export const markReturned = (id) => apiClient.put(`${endPoint}/mark-returned/${id}`)

export const confirmReturn = (id) => apiClient.delete(`${endPoint}/confirm-return/${id}`)

export const rejectConfirmation = (id) => apiClient.put(`${endPoint}/reject-confirmation/${id}`)

export const itemsMarkedAsReturned = () => apiClient.get(`${endPoint}/marked-as-returned`)

