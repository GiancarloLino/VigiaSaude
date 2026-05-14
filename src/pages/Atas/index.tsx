import { Link } from 'react-router';
import { mockAtas, mockFornecedores } from '../../lib/mockData';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Eye, Clock } from 'lucide-react';
import type { Ata } from '../../types';

export function AtasLista() {
  // Enrichment of Ata with Fornecedor Nome
  const data = mockAtas.map(ata => ({
    ...ata,
    fornecedorNome: mockFornecedores.find(f => f.id === ata.fornecedorId)?.nome || 'Desconhecido',
  }));

  const isVencendoEm45DiasOuMenos = (dataFim: string) => {
    const hoje = new Date();
    const fim = new Date(dataFim);
    const difTempo = fim.getTime() - hoje.getTime();
    const difDias = Math.ceil(difTempo / (1000 * 3600 * 24));
    return difDias >= 0 && difDias <= 45;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  const columns: ColumnDef<typeof data[0]>[] = [
    {
      header: 'Número da Ata',
      accessorKey: 'numero',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{row.numero}</span>
          {isVencendoEm45DiasOuMenos(row.dataFim) && (
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full" title="Vencendo em 45 dias ou menos">
              <Clock className="w-3 h-3" />
              <span>Próx. Vencimento</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Fornecedor',
      accessorKey: 'fornecedorNome',
      sortable: true,
    },
    {
      header: 'Fim da Vigência',
      accessorKey: 'dataFim',
      sortable: true,
      cell: (row) => formatDate(row.dataFim),
    },
    {
      header: 'Valor Teto',
      accessorKey: 'valorTeto',
      sortable: true,
      cell: (row) => formatCurrency(row.valorTeto),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        let variant: any = 'gray';
        if (row.status === 'ATIVA') variant = 'green';
        if (row.status === 'VENCIDA') variant = 'red';
        if (row.status === 'CANCELADA') variant = 'gray';
        if (row.status === 'EM_REVISAO') variant = 'yellow';
        return <StatusBadge status={row.status} variant={variant} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Atas (SRP)</h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe as Atas de Registro de Preços ativas e histórico.</p>
        </div>
      </div>

      <DataTable 
        data={data} 
        columns={columns} 
        rowActions={(row) => (
          <Link 
            to={`/atas/${row.id}`} 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:bg-gray-100 hover:text-gray-900 h-9 w-9"
            title="Visualizar Detalhes"
          >
            <Eye className="h-4 w-4 text-blue-600" />
          </Link>
        )}
      />
    </div>
  );
}
