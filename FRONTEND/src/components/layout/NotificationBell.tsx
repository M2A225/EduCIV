import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../services/notifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white bg-cta rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-elevated border border-border rounded-xl shadow-lg z-50 animate-slide-up">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-text-muted">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif: Notification) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const isUnread = !notification.read_at;
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <div
      className={`flex items-start gap-3 p-3 hover:bg-surface transition-colors ${
        isUnread ? 'bg-primary/5' : ''
      }`}
      onClick={() => isUnread && onRead(notification.id)}
    >
      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
        isUnread ? 'bg-cta' : 'bg-transparent'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{notification.title}</p>
        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notification.body}</p>
        <p className="text-xs text-text-muted/60 mt-1">{timeAgo}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isUnread && (
          <button
            onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
            className="p-1 hover:bg-surface rounded"
            title="Marquer comme lu"
          >
            <Check className="w-3 h-3 text-text-muted" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className="p-1 hover:bg-error/10 rounded"
          title="Supprimer"
        >
          <Trash2 className="w-3 h-3 text-text-muted hover:text-error" />
        </button>
      </div>
    </div>
  );
}
