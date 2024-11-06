import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, mark_notification_as_read } from '@/store/main';
import { Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  isModal: boolean;
}

const GV_NotificationSystem: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const globalNotifications = useSelector((state: RootState) => state.notifications.notifications);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState<Notification | null>(null);

  useEffect(() => {
    setNotifications(globalNotifications);
  }, [globalNotifications]);

  const addNotification = (notification: Notification) => {
    if (notification.isModal) {
      setCurrentModal(notification);
      setIsModalOpen(true);
    } else {
      setNotifications(prev => [...prev, notification]);
      if (notification.duration) {
        setTimeout(() => removeNotification(notification.id), notification.duration);
      }
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    dispatch(mark_notification_as_read(id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    globalNotifications.forEach(n => dispatch(mark_notification_as_read(n.id)));
  };

  const hideModal = () => {
    setIsModalOpen(false);
    if (currentModal) {
      dispatch(mark_notification_as_read(currentModal.id));
    }
    setCurrentModal(null);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />;
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {notifications.map((notification) => (
            <Transition
              key={notification.id}
              show={true}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <button
                        className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          ))}
        </div>
      </div>

      {/* Modal Notification */}
      {isModalOpen && currentModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  {getIcon(currentModal.type)}
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentModal.type.charAt(0).toUpperCase() + currentModal.type.slice(1)}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {currentModal.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  onClick={hideModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GV_NotificationSystem;