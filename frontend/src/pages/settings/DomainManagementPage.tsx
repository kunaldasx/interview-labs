import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

export default function DomainManagementPage() {
  const { data: sectors, isLoading: sectorsLoading } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => apiClient.get('/domains/sectors').then(r => r.data),
  });

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => apiClient.get('/domains/').then(r => r.data),
  });

  const { data: questionCount } = useQuery({
    queryKey: ['question-count'],
    queryFn: () => apiClient.get('/domains/stats/count').then(r => r.data),
  });

  if (sectorsLoading || domainsLoading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-4">
          <p className="text-sm text-gray-400">Total Sectors</p>
          <p className="text-2xl font-bold text-indigo-400">{sectors?.length || 0}</p>
        </div>
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-4">
          <p className="text-sm text-gray-400">Total Domains</p>
          <p className="text-2xl font-bold text-indigo-400">{domains?.length || 0}</p>
        </div>
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-4">
          <p className="text-sm text-gray-400">Total Questions</p>
          <p className="text-2xl font-bold text-indigo-400">{questionCount?.count || 0}</p>
        </div>
      </div>

      {sectors?.map((sector: any) => (
        <Card key={sector.sector_slug} title={`${sector.sector} (${sector.domain_count} domains)`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {domains
              ?.filter((d: any) => d.sector_slug === sector.sector_slug)
              .map((domain: any) => (
                <div key={domain.id} className="border border-white/[0.08] rounded-lg p-3">
                  <p className="text-sm font-medium text-white">{domain.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{domain.description || 'No description'}</p>
                </div>
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
