/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';

const API_BASE_URL = 'https://bakery-bakend.onrender.com/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

function normalize<T>(res: any): T {
  if (!res) return res as T;
  if (res.data && res.data.data !== undefined) return res.data.data as T;
  if (res.data !== undefined) return res.data as T;
  return res as T;
}

export const api = {
  products: {
    getAll: (params?: any): Promise<any[]> => axiosInstance.get('/products', { params }).then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/products/${id}`).then(res => normalize(res)),
    create: (product: object) => axiosInstance.post('/products', product).then(res => normalize(res)),
    update: (id: string | number, product: object) => axiosInstance.put(`/products/${id}`, product).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/products/${id}`).then(() => undefined),
  },
  categories: {
    getAll: (): Promise<any[]> => axiosInstance.get('/categories').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/categories/${id}`).then(res => normalize(res)),
    create: (category: object) => axiosInstance.post('/categories', category).then(res => normalize(res)),
    update: (id: string | number, category: object) => axiosInstance.put(`/categories/${id}`, category).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/categories/${id}`).then(() => undefined),
  },
  flavors: {
    getAll: (): Promise<any[]> => axiosInstance.get('/flavors').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/flavors/${id}`).then(res => normalize(res)),
    create: (flavor: object) => axiosInstance.post('/flavors', flavor).then(res => normalize(res)),
    update: (id: string | number, flavor: object) => axiosInstance.put(`/flavors/${id}`, flavor).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/flavors/${id}`).then(() => undefined),
  },
  weights: {
    getAll: (): Promise<any[]> => axiosInstance.get('/weights').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/weights/${id}`).then(res => normalize(res)),
    create: (weight: object) => axiosInstance.post('/weights', weight).then(res => normalize(res)),
    update: (id: string | number, weight: object) => axiosInstance.put(`/weights/${id}`, weight).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/weights/${id}`).then(() => undefined),
  },
  shapes: {
    getAll: (): Promise<any[]> => axiosInstance.get('/shapes').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/shapes/${id}`).then(res => normalize(res)),
    create: (shape: object) => axiosInstance.post('/shapes', shape).then(res => normalize(res)),
    update: (id: string | number, shape: object) => axiosInstance.put(`/shapes/${id}`, shape).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/shapes/${id}`).then(() => undefined),
  },
  themes: {
    getAll: (): Promise<any[]> => axiosInstance.get('/themes').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/themes/${id}`).then(res => normalize(res)),
    create: (theme: object) => axiosInstance.post('/themes', theme).then(res => normalize(res)),
    update: (id: string | number, theme: object) => axiosInstance.put(`/themes/${id}`, theme).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/themes/${id}`).then(() => undefined),
  },
  occasions: {
    getAll: (): Promise<any[]> => axiosInstance.get('/occasions').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/occasions/${id}`).then(res => normalize(res)),
    create: (occasion: object) => axiosInstance.post('/occasions', occasion).then(res => normalize(res)),
    update: (id: string | number, occasion: object) => axiosInstance.put(`/occasions/${id}`, occasion).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/occasions/${id}`).then(() => undefined),
  },
  types: {
    getAll: (): Promise<any[]> => axiosInstance.get('/types').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/types/${id}`).then(res => normalize(res)),
    create: (typeObj: object) => axiosInstance.post('/types', typeObj).then(res => normalize(res)),
    update: (id: string | number, typeObj: object) => axiosInstance.put(`/types/${id}`, typeObj).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/types/${id}`).then(() => undefined),
  },
  orders: {
    getAll: (): Promise<any[]> => axiosInstance.get('/orders').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/orders/${id}`).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/orders/${id}`).then(() => undefined),
  },
  customers: {
    getAll: (): Promise<any[]> => axiosInstance.get('/customers').then(res => normalize<any[]>(res)),
  },
  gallery: {
    getAll: (): Promise<any[]> => axiosInstance.get('/gallery').then(res => normalize<any[]>(res)),
    getById: (id: string | number) => axiosInstance.get(`/gallery/${id}`).then(res => normalize(res)),
    create: (item: object) => axiosInstance.post('/gallery', item).then(res => normalize(res)),
    update: (id: string | number, item: object) => axiosInstance.put(`/gallery/${id}`, item).then(res => normalize(res)),
    delete: (id: string | number) => axiosInstance.delete(`/gallery/${id}`).then(() => undefined),
  },
  contacts: {
    create: (payload: object) => axiosInstance.post('/contacts', payload).then(res => normalize(res)),
    list: () => axiosInstance.get('/contacts').then(res => normalize(res)),
    markRead: (id: string) => axiosInstance.post(`/contacts/${id}/read`).then(res => normalize(res)),
    delete: (id: string) => axiosInstance.delete(`/contacts/${id}`).then(() => undefined),
  },
  values: {
    get: (): Promise<any[]> => axiosInstance.get('/values').then(res => normalize<any[]>(res)),
    update: (values: any[]) => axiosInstance.put('/values', { values }).then(res => normalize<any[]>(res)),
  },
  events: {
    getActive: () => axiosInstance.get('/events/active').then(res => normalize(res)),
    getAll: () => axiosInstance.get('/events').then(res => normalize(res)),
    create: (event: object) => axiosInstance.post('/events', event).then(res => normalize(res)),
    update: (id: string, event: object) => axiosInstance.put(`/events/${id}`, event).then(res => normalize(res)),
    delete: (id: string) => axiosInstance.delete(`/events/${id}`).then(() => undefined),
  },
};

export default axiosInstance;
