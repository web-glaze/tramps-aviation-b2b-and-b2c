"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: "n1", title: "New Agent Registration", type: "info",
          message: "Priya Patel has submitted KYC for approval.", read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), link: "/admin/agents"
        },
        {
          id: "n2", title: "Booking Confirmed", type: "success",
          message: "Flight DEL→BOM booking BK-2341 confirmed.", read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), link: "/admin/bookings"
        },
        {
          id: "n3", title: "Low Wallet Balance", type: "warning",
          message: "Agent Vikram Joshi wallet below ₹5,000.", read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), link: "/admin/agents"
        },
        {
          id: "n4", title: "Payment Failed", type: "error",
          message: "Payment for booking BK-2340 failed. Retry needed.", read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        },
      ],
      addNotification: (n) => set(s => ({
        notifications: [{
          ...n, id: Date.now().toString(),
          read: false, createdAt: new Date().toISOString()
        }, ...s.notifications].slice(0, 50)
      })),
      markRead: (id) => set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      markAllRead: () => set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true }))
      })),
      clearAll: () => set({ notifications: [] }),
      unreadCount: () => get().notifications.filter(n => !n.read).length,
    }),
    { name: "notifications-store" }
  )
);
