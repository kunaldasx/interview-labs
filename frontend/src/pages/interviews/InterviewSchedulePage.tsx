import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { interviewsAPI } from '../../api/interviews';
import { jobsAPI } from '../../api/jobs';
import { candidatesAPI } from '../../api/candidates';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function InterviewSchedulePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    candidate_id: '',
    job_id: '',
    interview_type: 'ai_chat',
    duration_limit_min: 30,
    language: 'en',
    scheduled_at: '',
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: () => jobsAPI.list({ page_size: 100 }),
  });

  const { data: candidatesData } = useQuery({
    queryKey: ['candidates', 'all'],
    queryFn: () => candidatesAPI.list({ page_size: 100 }),
  });

  const mutation = useMutation({
    mutationFn: interviewsAPI.create,
    onSuccess: (data) => {
      toast.success('Interview scheduled');
      navigate(`/interviews/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to schedule interview');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      candidate_id: parseInt(form.candidate_id),
      job_id: parseInt(form.job_id),
      interview_type: form.interview_type,
      duration_limit_min: form.duration_limit_min,
      language: form.language,
      scheduled_at: form.scheduled_at || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Schedule Interview</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Candidate</label>
            <select
              value={form.candidate_id}
              onChange={(e) => setForm({ ...form, candidate_id: e.target.value })}
              className="block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              required
            >
              <option value="">Select a candidate</option>
              {candidatesData?.items?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — {c.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Job</label>
            <select
              value={form.job_id}
              onChange={(e) => setForm({ ...form, job_id: e.target.value })}
              className="block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              required
            >
              <option value="">Select a job</option>
              {jobsData?.items?.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} (ID: {j.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Interview Type</label>
            <select
              value={form.interview_type}
              onChange={(e) => setForm({ ...form, interview_type: e.target.value })}
              className="block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ai_chat">AI Chat</option>
              <option value="ai_voice">AI Voice</option>
              <option value="ai_both">AI Chat + Voice</option>
            </select>
          </div>

          <Input id="duration" label="Duration (minutes)" type="number" value={form.duration_limit_min} onChange={(e) => setForm({ ...form, duration_limit_min: parseInt(e.target.value) || 30 })} min={5} max={120} />
          <Input id="scheduled_at" label="Scheduled At" type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={mutation.isPending}>Schedule</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/interviews')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
