import React, { useEffect, useState, useRef } from "react";

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotifications, setToastNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const wsRef = useRef(null);
  const recentNotificationsRef = useRef(new Set());
  const toastTimeoutRef = useRef({});

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("sessionid");  
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = token 
      ? `${protocol}//localhost:8000/ws/notifications/?token=${token}`
      : `${protocol}//localhost:8000/ws/notifications/`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        const notificationKey = `${notification.type}_${notification.timestamp}_${notification.liked_by || notification.tagged_by}`;
        
        if (recentNotificationsRef.current.has(notificationKey)) {
          return;
        }
        
        recentNotificationsRef.current.add(notificationKey);
        
        setTimeout(() => {
          recentNotificationsRef.current.delete(notificationKey);
        }, 10000);
        
        const notifWithId = { ...notification, id: `${notificationKey}_${Date.now()}` };
        
        setNotifications((prev) => [notifWithId, ...prev]);
        setToastNotifications((prev) => [notifWithId, ...prev]);
        
        if (toastTimeoutRef.current[notifWithId.id]) {
          clearTimeout(toastTimeoutRef.current[notifWithId.id]);
        }
        
        toastTimeoutRef.current[notifWithId.id] = setTimeout(() => {
          setToastNotifications((prev) => prev.filter((n) => n.id !== notifWithId.id));
          delete toastTimeoutRef.current[notifWithId.id];
        }, 5000);
      } catch (err) {
      
      }
    };

    ws.onerror = (error) => {
      setConnectionStatus("error");
    };

    ws.onclose = (event) => {
      setConnectionStatus("disconnected");
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      Object.values(toastTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const dismissNotification = (notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-600 hover:text-gray-900 group"
          title={`WebSocket: ${connectionStatus}`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 z-50 w-80 mt-2 bg-white rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-gray-500">No notifications</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-start gap-3 justify-between group"
                  >
                    {notif.type === "like" && (
                      <>
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notif.liked_by} liked your photo
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              from <span className="font-semibold">{notif.event_name}</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Dismiss"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </>
                    )}
                    {notif.type === "tag" && (
                      <>
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A11.012 11.012 0 001.549 15.338c-.28.921-.12 1.909.328 2.636.968 1.627 3.065 2.285 5.078 1.579.974.355 2.062.445 3.179.225l1.267-3.804-2.322-2.321c-.52 1.042-1.02 2.109-.957 3.304.035.623.297 1.207.744 1.653.656.656 1.717.724 2.439.178l6.001-5.001 3.905 3.905c.52-.935 1.01-1.899 1.456-2.89 1.627-3.715.492-8.405-2.384-11.281zm-6.889 6.889l-1.414-1.414 2.121-2.121 1.414 1.414-2.121 2.121z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notif.tagged_by} tagged you in a photo
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              from <span className="font-semibold">{notif.event_name}</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Dismiss"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toastNotifications.slice(0, 3).map((notif) => (
          <div
            key={notif.id}
            className={`bg-white rounded-lg shadow-lg p-4 min-w-96 animate-fade-in border-l-4 ${notif.type === "like" ? "border-red-500" : "border-blue-500"}`}
          >
            {notif.type === "like" && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notif.liked_by} liked your photo
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    from {notif.event_name}
                  </p>
                </div>
              </div>
            )}
            {notif.type === "tag" && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A11.012 11.012 0 001.549 15.338c-.28.921-.12 1.909.328 2.636.968 1.627 3.065 2.285 5.078 1.579.974.355 2.062.445 3.179.225l1.267-3.804-2.322-2.321c-.52 1.042-1.02 2.109-.957 3.304.035.623.297 1.207.744 1.653.656.656 1.717.724 2.439.178l6.001-5.001 3.905 3.905c.52-.935 1.01-1.899 1.456-2.89 1.627-3.715.492-8.405-2.384-11.281zm-6.889 6.889l-1.414-1.414 2.121-2.121 1.414 1.414-2.121 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notif.tagged_by} tagged you in a photo
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    from {notif.event_name}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </>
  );
}

export default NotificationCenter;
