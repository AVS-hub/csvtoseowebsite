import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, mark_notification_as_read } from '@/store/main';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  isModal: boolean;
}

const ToastNotification: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = React.memo(({ notification, onClose }) => {
  const { id, type, message } = notification;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center justify-between`}
    >
      <p>{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close notification"
      >
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </motion.div>
  );
});

const ModalNotification: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = React.memo(({ notification, onClose }) => {
  const { id, type, message } = notification;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="bg-white rounded-lg p-6 max-w-md w-full"
      >
        <h2 className={`text-2xl font-bold mb-4 ${type === 'error' ? 'text-red-600' : 'text-gray-800'}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={() => onClose(id)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
});

const NotificationCenter: React.FC<{
  notifications: Notification[];
  onClose: (id: string) => void;
}> = React.memo(({ notifications, onClose }) => {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="mb-4 p-3 bg-gray-100 rounded">
            <p className="font-semibold">{notification.type}</p>
            <p>{notification.message}</p>
            <button
              onClick={() => onClose(notification.id)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Dismiss
            </button>
          </div>
        ))
      )}
    </div>
  );
});

const GV_NotificationSystem: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const globalNotifications = useSelector((state: RootState) => state.notifications.notifications);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const addNotification = useCallback((notification: Notification) => {
    setLocalNotifications((prevNotifications) => [...prevNotifications, notification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setLocalNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
    dispatch(mark_notification_as_read(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    setLocalNotifications([]);
  }, []);

  const showModal = useCallback((notification: Notification) => {
    addNotification(notification);
    setIsModalOpen(true);
  }, [addNotification]);

  const hideModal = useCallback((id: string) => {
    removeNotification(id);
    setIsModalOpen(false);
  }, [removeNotification]);

  useEffect(() => {
    globalNotifications.forEach((notification) => {
      if (!notification.read) {
        addNotification({
          id: notification.id,
          type: notification.type as 'success' | 'error' | 'warning' | 'info',
          message: notification.content,
          duration: 5000,
          isModal: false,
        });
      }
    });
  }, [globalNotifications, addNotification]);

  useEffect(() => {
    const timers = localNotifications.map((notification) => {
      if (notification.duration && !notification.isModal) {
        return setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer));
    };
  }, [localNotifications, removeNotification]);

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-4 max-w-sm">
        <AnimatePresence>
          {localNotifications
            .filter((notification) => !notification.isModal)
            .slice(0, 3)
            .map((notification) => (
              <ToastNotification
                key={notification.id}
                notification={notification}
                onClose={removeNotification}
              />
            ))}
        </AnimatePresence>
      </div>

      {/* Modal Notifications */}
      <AnimatePresence>
        {isModalOpen &&
          localNotifications
            .filter((notification) => notification.isModal)
            .map((notification) => (
              <ModalNotification
                key={notification.id}
                notification={notification}
                onClose={hideModal}
              />
            ))}
      </AnimatePresence>

      {/* Notification Center Toggle */}
      <button
        onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-label="Toggle Notification Center"
      >
        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
      </button>

      {/* Notification Center */}
      <AnimatePresence>
        {isNotificationCenterOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <NotificationCenter
              notifications={[...localNotifications, ...globalNotifications]}
              onClose={removeNotification}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GV_NotificationSystem;