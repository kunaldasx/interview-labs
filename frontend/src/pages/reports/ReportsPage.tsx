import { useState } from 'react';
import apiClient from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const downloadFile = async (url: string, filename: string, key: string) => {
    setIsDownloading(key);
    try {
      const response = await apiClient.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Downloaded ${filename}`);
    } catch (err: any) {
      toast.error('Download failed');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Candidates Report">
          <p className="text-sm text-gray-500 mb-4">Export all candidates data to Excel spreadsheet.</p>
          <Button
            onClick={() => downloadFile('/reports/candidates/excel', 'candidates_report.xlsx', 'candidates')}
            isLoading={isDownloading === 'candidates'}
            variant="outline"
          >
            Download Excel
          </Button>
        </Card>

        <Card title="Evaluations Report">
          <p className="text-sm text-gray-500 mb-4">Export all evaluations data to Excel spreadsheet.</p>
          <Button
            onClick={() => downloadFile('/reports/evaluations/excel', 'evaluations_report.xlsx', 'evaluations')}
            isLoading={isDownloading === 'evaluations'}
            variant="outline"
          >
            Download Excel
          </Button>
        </Card>

        <Card title="Evaluation PDF">
          <p className="text-sm text-gray-500 mb-4">Generate a PDF report for a specific evaluation.</p>
          <div className="flex gap-2">
            <input
              id="eval-id"
              type="number"
              placeholder="Evaluation ID"
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              onClick={() => {
                const evalId = (document.getElementById('eval-id') as HTMLInputElement)?.value;
                if (evalId) downloadFile(`/reports/evaluation/${evalId}/pdf`, `evaluation_${evalId}.pdf`, 'pdf');
              }}
              isLoading={isDownloading === 'pdf'}
              variant="outline"
            >
              Download PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
