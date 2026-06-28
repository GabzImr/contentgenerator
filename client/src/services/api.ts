import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface Content {
  id: string;
  title: string;
  descriptionML: string;
  descriptionShopee: string;
  keywords: string; // JSON string
  instagramPost: string;
  instagramHashtags: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  link?: string;
  createdAt: string;
  contents: Content[];
}

export const generateContent = (name: string, link?: string) =>
  api.post<Product>('/generate', { name, link });

export const getContents = () =>
  api.get<Product[]>('/contents');

export const deleteContent = (id: string) =>
  api.delete(`/contents/${id}`);
