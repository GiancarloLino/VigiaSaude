import apiClient from './apiClient';
import type { PedidoCompra } from '../types';

export interface PedidoWithAta extends PedidoCompra {
  ataNumero: string;
}

export const getPedidos = async (): Promise<PedidoWithAta[]> => {
  const response = await apiClient.get<PedidoWithAta[]>('/api/pedidos');
  return response.data;
};

export const getPedidoById = async (id: string): Promise<PedidoWithAta | null> => {
  const response = await apiClient.get<PedidoWithAta>(`/api/pedidos/${id}`);
  return response.data;
};

export const confirmarEntrega = async (id: string): Promise<PedidoCompra> => {
  const response = await apiClient.patch<PedidoCompra>(`/api/pedidos/${id}/entrega`);
  return response.data;
};
