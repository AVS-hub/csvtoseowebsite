import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, mark_notification_as_read } from '@/store/main';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

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
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div className={`${bgColor} text-white p-4 rounded-md shadow-lg flex justify-between items-center`}>
      <p>{message}</p>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

const ModalNotification: React.FC<ModalNotification> = ({ title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          {cancelText && (
            <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              {cancelText}
            </button>
          )}
          {confirmText && (
            <button onClick={onConfirm} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              {confirmText}
            </button>
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
    // Filter and set toast notifications from global notifications
    const newToasts = globalNotifications.filter(n => !n.read && !n.isModal).map(n => ({
      id: n.id,
      type: n.type as 'success' | 'error' | 'warning' | 'info',
      message: n.content,
      duration: 5000, // Default duration
    }));
    setToastNotifications(prevToasts => [...prevToasts, ...newToasts]);

    // Check for modal notifications
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
      <div className="fixed top-4 right-4 z-50">
        <TransitionGroup>
          {toastNotifications.map((toast) => (
            <CSSTransition key={toast.id} timeout={300} classNames="notification">
              <div className="mb-2">
                <ToastNotification {...toast} onClose={() => handleCloseNotification(toast.id)} />
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>

      {/* Modal Notification */}
      {modalNotification && <ModalNotification {...modalNotification} />}

      {/* Notification Center Toggle */}
      <button
        onClick={toggleNotificationCenter}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {/* Notification Center */}
      {isNotificationCenterOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-4 overflow-y-auto z-40">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          {globalNotifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            globalNotifications.map((notification) => (
              <div key={notification.id} className="mb-4 p-2 bg-gray-100 rounded">
                <p className={`font-bold ${notification.read ? 'text-gray-500' : 'text-black'}`}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </p>
                <p>{notification.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
          <button
            onClick={toggleNotificationCenter}
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default React.memo(GV_NotificationSystem);