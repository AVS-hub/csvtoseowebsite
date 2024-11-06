import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, mark_notification_as_read } from '@/store/main';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Info, X, Bell } from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ModalNotification {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ToastNotification: React.FC<ToastNotification & { onClose: () => void }> = ({ type, message, onClose }) => {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className="bg-white border-l-4 border-t border-r border-b rounded-md shadow-lg flex items-center p-4 mb-4" style={{ borderLeftColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6' }}>
      <div className="flex-shrink-0 mr-3">
        {iconMap[type]}
      </div>
      <div className="flex-grow mr-3">
        <p className="text-sm text-gray-800">{message}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const ModalNotification: React.FC<ModalNotification> = ({ title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          {cancelText && (
            <Button variant="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          {confirmText && (
            <Button onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const GV_NotificationSystem: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const globalNotifications = useSelector((state: RootState) => state.notifications.notifications);
  
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  const [modalNotification, setModalNotification] = useState<ModalNotification | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  useEffect(() => {
    const newToasts = globalNotifications.filter(n => !n.read && !n.isModal).map(n => ({
      id: n.id,
      type: n.type as 'success' | 'error' | 'warning' | 'info',
      message: n.content,
      duration: 5000,
    }));
    setToastNotifications(prevToasts => [...prevToasts, ...newToasts]);

    const modalNotif = globalNotifications.find(n => !n.read && n.isModal);
    if (modalNotif) {
      setModalNotification({
        id: modalNotif.id,
        title: 'Important Notification',
        message: modalNotif.content,
        confirmText: 'OK',
        onConfirm: () => handleCloseNotification(modalNotif.id),
        onCancel: () => handleCloseNotification(modalNotif.id),
      });
    }
  }, [globalNotifications]);

  const handleCloseNotification = useCallback((id: string) => {
    dispatch(mark_notification_as_read(id));
    setToastNotifications(prevToasts => prevToasts.filter(toast => toast.id !== id));
    setModalNotification(null);
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setToastNotifications(prevToasts => 
        prevToasts.filter(toast => {
          if (toast.duration && Date.now() - new Date(toast.id).getTime() > toast.duration) {
            handleCloseNotification(toast.id);
            return false;
          }
          return true;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [handleCloseNotification]);

  const toggleNotificationCenter = () => {
    setIsNotificationCenterOpen(prev => !prev);
  };

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 w-full sm:w-96 max-w-full">
        <TransitionGroup>
          {toastNotifications.map((toast) => (
            <CSSTransition key={toast.id} timeout={300} classNames="notification">
              <ToastNotification {...toast} onClose={() => handleCloseNotification(toast.id)} />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>

      {/* Modal Notification */}
      {modalNotification && <ModalNotification {...modalNotification} />}

      {/* Notification Center Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleNotificationCenter}
        className="fixed bottom-4 right-4 rounded-full shadow-lg"
      >
        <Bell className="h-5 w-5" />
      </Button>

      {/* Notification Center */}
      {isNotificationCenterOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white shadow-lg p-4 overflow-y-auto z-40">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          {globalNotifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            globalNotifications.map((notification) => (
              <div key={notification.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className={`font-semibold ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </p>
                <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
          <Button
            onClick={toggleNotificationCenter}
            className="mt-4 w-full"
          >
            Close
          </Button>
        </div>
      )}
    </>
  );
};

export default React.memo(GV_NotificationSystem);