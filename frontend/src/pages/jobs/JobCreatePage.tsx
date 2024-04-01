import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function JobCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    experience_min: 0,
    experience_max: 5,
    education_level: '',
    location: '',
    salary_range: '',
  });

  const mutation = useMutation({
    mutationFn: jobsAPI.create,
    onSuccess: (data) => {
      toast.success('Job created successfully');
      navigate(`/jobs/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create job');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Job Description</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="title" label="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="exp_min" label="Min Experience (yrs)" type="number" value={form.experience_min} onChange={(e) => setForm({ ...form, experience_min: parseInt(e.target.value) || 0 })} />
            <Input id="exp_max" label="Max Experience (yrs)" type="number" value={form.experience_max} onChange={(e) => setForm({ ...form, experience_max: parseInt(e.target.value) || 0 })} />
          </div>

          <Input id="education" label="Education Level" value={form.education_level} onChange={(e) => setForm({ ...form, education_level: e.target.value })} />
          <Input id="location" label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input id="salary" label="Salary Range" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={mutation.isPending}>Create Job</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/jobs')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
