import { request } from "../api/apiClient";

export interface PortalNotification {
  _id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationSummary {
  unread_count: number;
  recent_notifications: PortalNotification[];
  category_counts: Record<string, number>;
}

export const notificationService = {
  getSummary() {
    return request<NotificationSummary>("/notifications/summary");
  },
  getRecent(limit = 8) {
    return request<{ notifications: PortalNotification[]; meta?: unknown }>(
      `/notifications?limit=${limit}`
    );
  },
};
