import { useParams } from 'react-router';
import { mockAtas, mockFornecedores, mockMedicamentosAta, mockPedidosCompra } from '../../lib/mockData';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { Clock } from 'lucide-react';

export function AtasDetalhes() {
  const { id } = useParams<{ id: string }>();

  const ata = mockAtas.find(a => a.id === id);
  const fornecedor = mockFornecedores.find(f => f.id === ata?.fornecedorId);
  
  if (!ata) {
    return <div className="p-8 text-center text-gray-500">Ata não encontrada.</div>;
  }

  // Lógica de consumo
  const pedidosAta = mockPedidosCompra.filter(p => p.ataId === ata.id);
  
  const consumido = pedidosAta
    .filter(p => p.status === 'ENTREGUE')
    .reduce((acc, curr) => acc + curr.valorTotal, 0);

  const comprometido = pedidosAta
    .filter(p => p.status === 'APROVADO' || p.status === 'EM_TRANSITO')
    .reduce((acc, curr) => acc + curr.valorTotal, 0);

  const disponivel = ata.valorTeto - consumido - comprometido;

  // Lógica de alertas de vigência
  const hoje = new Date();
  const fim = new Date(ata.dataFim);
  const difDias = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
  const isVencendo = difDias >= 0 && difDias <= 45;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  // Dados da tabela de medicamentos
  const medicamentos = mockMedicamentosAta.filter(m => m.ataId === ata.id);

  const columns: ColumnDef<typeof medicamentos[0]>[] = [
    { header: 'Nome do Medicamento', accessorKey: 'nome', sortable: true },
    { header: 'P. Unitário', cell: (row) => formatCurrency(row.precoUnitario) },
    { header: 'Preço BPS', cell: (row) => formatCurrency(row.precoBPS) },
    { header: 'Preço CMED', cell: (row) => formatCurrency(row.precoCMED) },
    { header: 'Qtd Inicial', cell: (row) => row.quantidadeInicial.toLocaleString('pt-BR') },
    { header: 'Qtd Usada', cell: (row) => row.quantidadeUsada.toLocaleString('pt-BR') },
    {
      header: 'Consumo',
      cell: (row) => {
        const percent = (row.quantidadeUsada / row.quantidadeInicial) * 100;
        return <ProgressBar percentage={percent} variant="linear" className="w-32" />;
      }
    }
  ];

  // Renderização do detalhe da linha (Pedidos que usaram o medicamento)
  const renderExpandedRow = (medicamento: typeof medicamentos[0]) => {
    // Acha os pedidos dessa ata que contém esse medicamento
    const pedidosComItem = pedidosAta.filter(p => p.itens.some(i => i.medicamentoId === medicamento.id));

    if (pedidosComItem.length === 0) {
      return <p className="text-sm text-gray-500">Nenhum pedido realizado para este item.</p>;
    }

    return (
      <div className="bg-white p-4 rounded border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Histórico de Pedidos</h4>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2">ID Pedido</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Qtd Solicitada</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidosComItem.map(p => {
              const itemInfo = p.itens.find(i => i.medicamentoId === medicamento.id);
              return (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-gray-800">{p.id.toUpperCase()}</td>
                  <td className="px-3 py-2 text-gray-600">{formatDate(p.dataCriacao)}</td>
                  <td className="px-3 py-2 text-gray-600">{itemInfo?.quantidade.toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {p.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ata {ata.numero}</h1>
          <p className="mt-1 text-sm text-gray-500">Fornecedor: <span className="font-medium text-gray-900">{fornecedor?.nome}</span></p>
        </div>
      </div>

      {isVencendo && (
        <AlertBanner variant="warning" title="Atenção: Vigência próxima do fim">
          Ata vence em {difDias} {difDias === 1 ? 'dia' : 'dias'} ({formatDate(ata.dataFim)}). Planeje novas licitações para evitar desabastecimento.
        </AlertBanner>
      )}

      {/* 4 Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Valor Teto</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(ata.valorTeto)}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Consumido (Entregue)</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(consumido)}</p>
          <ProgressBar percentage={(consumido / ata.valorTeto) * 100} className="mt-3" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Comprometido</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{formatCurrency(comprometido)}</p>
          <ProgressBar percentage={(comprometido / ata.valorTeto) * 100} className="mt-3" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Saldo Disponível</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(disponivel)}</p>
          <ProgressBar percentage={(disponivel / ata.valorTeto) * 100} className="mt-3" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens da Ata</h3>
        <DataTable 
          data={medicamentos}
          columns={columns}
          renderExpandedRow={renderExpandedRow}
        />
      </div>
    </div>
  );
}
