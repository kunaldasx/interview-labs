import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerLettersAPI } from '../../api/offerLetters';
import { interviewsAPI } from '../../api/interviews';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function OfferLetterFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interview_id');
  const isEdit = !!id;

  const [form, setForm] = useState({
    interview_id: interviewId ? Number(interviewId) : 0,
    salary: 0,
    currency: 'USD',
    start_date: '',
    end_date: '',
    benefits: '',
    reporting_manager: '',
    department: '',
    location: '',
    additional_terms: '',
  });

  // Fetch existing offer for edit mode
  const { data: existingOffer, isLoading: loadingOffer } = useQuery({
    queryKey: ['offer-letter', id],
    queryFn: () => offerLettersAPI.get(Number(id)),
    enabled: isEdit,
  });

  // Fetch interview to pre-fill job details
  const { data: interview } = useQuery({
    queryKey: ['interview', interviewId],
    queryFn: () => interviewsAPI.get(Number(interviewId)),
    enabled: !!interviewId && !isEdit,
  });

  // Fetch job data to pre-fill department/location
  const jobId = isEdit ? existingOffer?.job_id : interview?.job_id;
  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsAPI.get(Number(jobId)),
    enabled: !!jobId,
  });

  // Pre-fill from job data
  useEffect(() => {
    if (job && !isEdit) {
      setForm((prev) => ({
        ...prev,
        department: prev.department,
        location: job.location || prev.location,
      }));
    }
  }, [job, isEdit]);

  // Load existing offer data for edit
  useEffect(() => {
    if (existingOffer && isEdit) {
      setForm({
        interview_id: existingOffer.interview_id,
        salary: existingOffer.salary,
        currency: existingOffer.currency,
        start_date: existingOffer.start_date,
        end_date: existingOffer.end_date || '',
        benefits: existingOffer.benefits,
        reporting_manager: existingOffer.reporting_manager,
        department: existingOffer.department,
        location: existingOffer.location,
        additional_terms: existingOffer.additional_terms || '',
      });
    }
  }, [existingOffer, isEdit]);

  const createMutation = useMutation({
    mutationFn: offerLettersAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offer-letters'] });
      toast.success('Offer letter created');
      navigate(`/offer-letters/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create offer letter');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => offerLettersAPI.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-letters'] });
      queryClient.invalidateQueries({ queryKey: ['offer-letter', id] });
      toast.success('Offer letter updated');
      navigate(`/offer-letters/${id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update offer letter');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      const { interview_id, ...updateData } = form;
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingOffer) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">
        {isEdit ? 'Edit Offer Letter' : 'Create Offer Letter'}
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <Input
              id="interview_id"
              label="Interview ID"
              type="number"
              value={form.interview_id}
              onChange={(e) => setForm({ ...form, interview_id: parseInt(e.target.value) || 0 })}
              required
              disabled={!!interviewId}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="salary"
              label="Salary"
              type="number"
              value={form.salary || ''}
              onChange={(e) => setForm({ ...form, salary: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              id="currency"
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="start_date"
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
            <Input
              id="end_date"
              label="End Date (optional)"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>

          <Input
            id="reporting_manager"
            label="Reporting Manager"
            value={form.reporting_manager}
            onChange={(e) => setForm({ ...form, reporting_manager: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="department"
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            />
            <Input
              id="location"
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Benefits</label>
            <textarea
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              rows={4}
              className="block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Health insurance, PTO, retirement plan..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Additional Terms (optional)</label>
            <textarea
              value={form.additional_terms}
              onChange={(e) => setForm({ ...form, additional_terms: e.target.value })}
              rows={3}
              className="block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Non-compete, probation period, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isPending}>
              {isEdit ? 'Update Offer' : 'Create Offer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/offer-letters')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
