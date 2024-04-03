import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../lib/formatters';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications/').then(r => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Marked as read');
    },
  });

  if (isLoading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {data?.unread_count || 0} unread notifications
        </p>
      </div>

      <div className="space-y-2">
        {data?.items?.map((notification: any) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg border p-4 ${
              notification.read_at ? 'border-gray-200' : 'border-indigo-200 bg-indigo-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge status={notification.notification_type} />
                  <Badge status={notification.status} />
                </div>
                {notification.subject && (
                  <p className="text-sm font-medium text-gray-900">{notification.subject}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDateTime(notification.created_at)}</p>
              </div>
              {!notification.read_at && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markReadMutation.mutate(notification.id)}
                >
                  Mark Read
                </Button>
              )}
            </div>
          </div>
        ))}

        {(!data?.items || data.items.length === 0) && (
          <div className="text-center py-8 text-sm text-gray-500">No notifications</div>
        )}
      </div>
    </div>
  );
}
