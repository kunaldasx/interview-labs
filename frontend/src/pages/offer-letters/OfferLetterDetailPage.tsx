import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerLettersAPI } from '../../api/offerLetters';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatDate, formatDateTime } from '../../lib/formatters';
import toast from 'react-hot-toast';

export default function OfferLetterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: offer, isLoading } = useQuery({
    queryKey: ['offer-letter', id],
    queryFn: () => offerLettersAPI.get(Number(id)),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => offerLettersAPI.submitForApproval(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-letter', id] });
      toast.success('Submitted for approval');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to submit'),
  });

  const approveMutation = useMutation({
    mutationFn: () => offerLettersAPI.approve(Number(id), { approved: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-letter', id] });
      toast.success('Offer letter approved');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      offerLettersAPI.approve(Number(id), { approved: false, rejection_reason: rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-letter', id] });
      toast.success('Offer letter rejected');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to reject'),
  });

  const sendMutation = useMutation({
    mutationFn: () => offerLettersAPI.send(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-letter', id] });
      toast.success('Offer letter sent to candidate');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to send'),
  });

  if (isLoading) return <Spinner size="lg" className="py-20" />;
  if (!offer) return <div className="text-center py-20 text-gray-500">Offer letter not found</div>;

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/offer-letters" className="text-sm text-indigo-400 hover:text-indigo-300">
          Back to Offer Letters
        </Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold text-white">Offer Letter #{offer.id}</h1>
          <Badge status={offer.status} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Candidate & Job">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Candidate</span>
              <span className="text-sm text-white font-medium">{offer.candidate_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Email</span>
              <span className="text-sm text-gray-300">{offer.candidate_email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Job Title</span>
              <span className="text-sm text-white font-medium">{offer.job_title || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Interview ID</span>
              <Link to={`/interviews/${offer.interview_id}`} className="text-sm text-primary-400 hover:text-primary-300">
                #{offer.interview_id}
              </Link>
            </div>
          </div>
        </Card>

        <Card title="Compensation">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Salary</span>
              <span className="text-sm text-white font-semibold">
                {offer.currency} {offer.salary.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Start Date</span>
              <span className="text-sm text-white">{formatDate(offer.start_date)}</span>
            </div>
            {offer.end_date && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">End Date</span>
                <span className="text-sm text-white">{formatDate(offer.end_date)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Department</span>
              <span className="text-sm text-white">{offer.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Location</span>
              <span className="text-sm text-white">{offer.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Reporting Manager</span>
              <span className="text-sm text-white">{offer.reporting_manager}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Benefits">
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{offer.benefits}</p>
      </Card>

      {offer.additional_terms && (
        <Card title="Additional Terms">
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{offer.additional_terms}</p>
        </Card>
      )}

      {offer.rejection_reason && (
        <Card title="Rejection Reason">
          <p className="text-sm text-red-400 whitespace-pre-wrap">{offer.rejection_reason}</p>
        </Card>
      )}

      {/* Timeline */}
      <Card title="Timeline">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Created</span>
            <span className="text-gray-300">{formatDateTime(offer.created_at)}</span>
          </div>
          {offer.approved_at && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Approved</span>
              <span className="text-gray-300">{formatDateTime(offer.approved_at)}</span>
            </div>
          )}
          {offer.sent_at && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Sent</span>
              <span className="text-gray-300">{formatDateTime(offer.sent_at)}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {offer.status === 'draft' && (
          <>
            <Button onClick={() => navigate(`/offer-letters/${offer.id}/edit`)}>Edit</Button>
            <Button
              variant="secondary"
              onClick={() => submitMutation.mutate()}
              isLoading={submitMutation.isPending}
            >
              Submit for Approval
            </Button>
          </>
        )}

        {offer.status === 'pending_approval' && isSuperAdmin && (
          <>
            <Button onClick={() => approveMutation.mutate()} isLoading={approveMutation.isPending}>
              Approve
            </Button>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <Button
                variant="danger"
                onClick={() => rejectMutation.mutate()}
                isLoading={rejectMutation.isPending}
              >
                Reject
              </Button>
            </div>
          </>
        )}

        {offer.status === 'approved' && (
          <Button onClick={() => sendMutation.mutate()} isLoading={sendMutation.isPending}>
            Send to Candidate
          </Button>
        )}
      </div>
    </div>
  );
}
