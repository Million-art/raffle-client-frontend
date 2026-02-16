import { apiFetch } from "@/lib/api";

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    raffleId?: string;
    isRead: boolean;
    priority: string;
    createdAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
}

export async function getNotifications(limit: number = 20, offset: number = 0): Promise<NotificationsResponse> {
    return await apiFetch<NotificationsResponse>(`/api/notifications?limit=${limit}&offset=${offset}`);
}

export async function getUnreadCount(): Promise<number> {
    const data = await apiFetch<{ count: number }>('/api/notifications/unread/count');
    return data.count;
}

export async function markAsRead(notificationId: string): Promise<void> {
    await apiFetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
    });
}

export async function markAllAsRead(): Promise<void> {
    await apiFetch('/api/notifications/read-all', {
        method: 'PUT',
    });
}

export async function deleteNotification(notificationId: string): Promise<void> {
    await apiFetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
    });
}
