import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { candidatesAPI } from '../../api/candidates';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function CandidateRegistrationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    experience_years: 0,
    education: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: candidatesAPI.create,
    onSuccess: async (candidate) => {
      if (resumeFile) {
        try {
          await candidatesAPI.uploadResume(candidate.id, resumeFile);
          toast.success('Candidate registered with resume');
        } catch {
          toast.success('Candidate registered (resume upload failed)');
        }
      } else {
        toast.success('Candidate registered successfully');
      }
      navigate(`/candidates/${candidate.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Register Candidate</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input id="phone" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input id="experience" label="Years of Experience" type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} />
          <Input id="education" label="Education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF/DOCX)</label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={createMutation.isPending}>Register</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/candidates')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
