"use client";

import { useState, useEffect } from "react";
import {
  KnockProvider,
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
} from "@knocklabs/react";
import { useCallback } from "react";

// Knock CSS imports
import "@knocklabs/react/dist/index.css";

interface KnockNotificationsProps {
  userId: string;
  userToken?: string;
}

export function KnockNotifications({ userId, userToken }: KnockNotificationsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  // Get Knock public API key from environment
  const knockApiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY || "";
  const knockFeedId = process.env.NEXT_PUBLIC_KNOCK_FEED_ID || "";

  if (!knockApiKey || !knockFeedId) {
    console.warn("Knock configuration missing");
    return null;
  }

  return (
    <KnockProvider
      apiKey={knockApiKey}
      userId={userId}
      userToken={userToken}
    >
      <KnockFeedProvider 
        feedId={knockFeedId}
        colorMode="light"
      >
        {/* Notification Bell Icon */}
        <NotificationIconButton
          ref={(ref) => setButtonRef(ref)}
          onClick={() => setIsVisible(!isVisible)}
        />
        
        {/* Notification Feed Popover */}
        <NotificationFeedPopover
          buttonRef={buttonRef}
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
          placement="bottom-end"
        />
      </KnockFeedProvider>
    </KnockProvider>
  );
}

// Custom styled notification component
export function CustomKnockNotifications({ userId, userToken }: KnockNotificationsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const knockApiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY || "";
  const knockFeedId = process.env.NEXT_PUBLIC_KNOCK_FEED_ID || "";

  if (!knockApiKey || !knockFeedId) {
    return null;
  }

  const onNotificationsReceive = useCallback((notification: any) => {
    console.log("New notification received:", notification);
    
    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title || "새 알림", {
        body: notification.message || "새로운 알림이 도착했습니다.",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  }, []);

  return (
    <KnockProvider
      apiKey={knockApiKey}
      userId={userId}
      userToken={userToken}
    >
      <KnockFeedProvider 
        feedId={knockFeedId}
        colorMode="light"
        onNotificationsReceive={onNotificationsReceive}
      >
        <div className="relative">
          {/* Custom Bell Button */}
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
            
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Custom Notification Panel */}
          {isVisible && (
            <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">알림</h3>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <NotificationFeedPopover
                  buttonRef={null}
                  isVisible={true}
                  onClose={() => setIsVisible(false)}
                  placement="bottom-end"
                />
              </div>
            </div>
          )}
        </div>
      </KnockFeedProvider>
    </KnockProvider>
  );
}