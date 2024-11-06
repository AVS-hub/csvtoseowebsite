import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, mark_notification_as_read } from '@/store/main';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  isModal: boolean;
}

const ToastNotification: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onClose();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[notification.type];

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center justify-between`}>
      <p>{notification.message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Close notification"
      >
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

const ModalNotification: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-md w-full"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <h2 className="text-xl font-bold mb-4">{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</h2>
        <p className="mb-6">{notification.message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const GV_NotificationSystem: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const [activeModal, setActiveModal] = useState<Notification | null>(null);

  useEffect(() => {
    const modal = notifications.find(n => n.isModal);
    if (modal && !activeModal) {
      setActiveModal(modal);
    }
  }, [notifications, activeModal]);

  const handleCloseNotification = (id: string) => {
    dispatch(mark_notification_as_read(id));
  };

  const handleCloseModal = () => {
    if (activeModal) {
      dispatch(mark_notification_as_read(activeModal.id));
      setActiveModal(null);
    }
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 space-y-4 w-72">
        <TransitionGroup>
          {notifications.filter(n => !n.isModal).map((notification) => (
            <CSSTransition
              key={notification.id}
              timeout={300}
              classNames={{
                enter: 'transform ease-out duration-300 transition',
                enterActive: 'translate-y-0 opacity-100 sm:translate-x-0',
                enterDone: 'translate-y-0 opacity-100 sm:translate-x-0',
                exit: 'transition ease-in duration-100',
                exitActive: 'opacity-0',
              }}
            >
              <ToastNotification
                notification={notification}
                onClose={() => handleCloseNotification(notification.id)}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
      {activeModal && (
        <ModalNotification
          notification={activeModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default GV_NotificationSystem;