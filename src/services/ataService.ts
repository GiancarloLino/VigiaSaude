import apiClient from './apiClient';
import type { Ata, MedicamentoAta, PedidoCompra } from '../types';

export interface AtaWithFornecedor extends Ata {
  fornecedorNome: string;
}

export interface AtaFullDetails extends AtaWithFornecedor {
  medicamentos: MedicamentoAta[];
  pedidos: PedidoCompra[];
}

export const getAtas = async (): Promise<AtaWithFornecedor[]> => {
  const response = await apiClient.get<AtaWithFornecedor[]>('/api/atas');
  return response.data;
};

export const getAtaFullDetails = async (id: string): Promise<AtaFullDetails | null> => {
  const response = await apiClient.get<AtaFullDetails>(`/api/atas/${id}`);
  return response.data;
};
