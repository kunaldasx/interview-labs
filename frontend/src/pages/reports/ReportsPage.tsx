import { useState } from 'react';
import apiClient from '../../api/client';
import { evaluationsAPI } from '../../api/evaluations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState('');

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

  const downloadEvalPdf = async () => {
    if (!interviewId) return;
    setIsDownloading('pdf');
    try {
      const evaluation = await evaluationsAPI.getByInterview(Number(interviewId));
      if (!evaluation) {
        toast.error('No evaluation found for this interview');
        return;
      }
      const response = await apiClient.get(`/reports/evaluation/${evaluation.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluation_interview_${interviewId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('No evaluation found for this interview');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Reports & Export</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Candidates Report">
          <p className="text-sm text-gray-400 mb-4">Export all candidates data to Excel spreadsheet.</p>
          <Button
            onClick={() => downloadFile('/reports/candidates/excel', 'candidates_report.xlsx', 'candidates')}
            isLoading={isDownloading === 'candidates'}
            variant="outline"
          >
            Download Excel
          </Button>
        </Card>

        <Card title="Evaluations Report">
          <p className="text-sm text-gray-400 mb-4">Export all evaluations data to Excel spreadsheet.</p>
          <Button
            onClick={() => downloadFile('/reports/evaluations/excel', 'evaluations_report.xlsx', 'evaluations')}
            isLoading={isDownloading === 'evaluations'}
            variant="outline"
          >
            Download Excel
          </Button>
        </Card>

        <Card title="Evaluation PDF">
          <p className="text-sm text-gray-400 mb-4">Generate a PDF report by Interview ID.</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={interviewId}
              onChange={(e) => setInterviewId(e.target.value)}
              placeholder="Interview ID"
              className="w-32 rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            <Button
              onClick={downloadEvalPdf}
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
