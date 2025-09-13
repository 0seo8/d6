import Knock from "@knocklabs/node";

// Initialize Knock client for server-side operations
export const knockClient = new Knock(
  process.env.KNOCK_SECRET_API_KEY || ""
);

// Notification templates/workflows
export const KNOCK_WORKFLOWS = {
  // System alerts
  SYSTEM_DOWN: "system-down",
  HIGH_ERROR_RATE: "high-error-rate",
  LOW_SUCCESS_RATE: "low-success-rate",
  
  // Usage alerts
  API_LIMIT_WARNING: "api-limit-warning",
  API_LIMIT_CRITICAL: "api-limit-critical",
  
  // Crawling alerts
  CRAWLER_SUCCESS: "crawler-success",
  CRAWLER_FAILED: "crawler-failed",
  CRAWLER_STUCK: "crawler-stuck",
  
  // Platform specific
  PLATFORM_DOWN: "platform-down",
  PLATFORM_RECOVERED: "platform-recovered",
} as const;

export type WorkflowKey = keyof typeof KNOCK_WORKFLOWS;

// Notification types
export interface CrawlerNotification {
  workflow: string;
  recipient: string;
  data: {
    title: string;
    message: string;
    severity: "info" | "warning" | "error" | "critical";
    platform?: string;
    errorCount?: number;
    successRate?: number;
    timestamp: string;
    actionUrl?: string;
    actionLabel?: string;
  };
  tenant?: string;
}

// Send notification helper
export async function sendNotification(notification: CrawlerNotification) {
  try {
    const result = await knockClient.workflows.trigger(notification.workflow, {
      recipients: [notification.recipient],
      data: notification.data,
      tenant: notification.tenant,
    });
    
    console.log("Notification sent:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error };
  }
}

// Batch notifications helper
export async function sendBatchNotifications(
  workflow: string,
  recipients: string[],
  data: CrawlerNotification["data"]
) {
  try {
    const result = await knockClient.workflows.trigger(workflow, {
      recipients,
      data,
    });
    
    console.log("Batch notifications sent:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Failed to send batch notifications:", error);
    return { success: false, error };
  }
}

// Check notification status
export async function getNotificationStatus(workflowRunId: string) {
  try {
    const status = await knockClient.workflows.getRun(workflowRunId);
    return status;
  } catch (error) {
    console.error("Failed to get notification status:", error);
    return null;
  }
}

// Cancel scheduled notification
export async function cancelNotification(workflowRunId: string) {
  try {
    await knockClient.workflows.cancel(workflowRunId);
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel notification:", error);
    return { success: false, error };
  }
}

// User management
export async function identifyUser(userId: string, userData: {
  email?: string;
  name?: string;
  phoneNumber?: string;
  preferences?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
    slack?: boolean;
  };
}) {
  try {
    await knockClient.users.identify(userId, {
      email: userData.email,
      name: userData.name,
      phone_number: userData.phoneNumber,
      // Custom properties
      preferences: userData.preferences,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to identify user:", error);
    return { success: false, error };
  }
}

// Get user's notification preferences
export async function getUserPreferences(userId: string) {
  try {
    const preferences = await knockClient.users.getPreferences(userId);
    return preferences;
  } catch (error) {
    console.error("Failed to get user preferences:", error);
    return null;
  }
}

// Update user's notification preferences
export async function updateUserPreferences(
  userId: string,
  preferences: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
    slack?: boolean;
  }
) {
  try {
    await knockClient.users.setPreferences(userId, {
      channel_types: {
        email: preferences.email ?? true,
        push: preferences.push ?? true,
        in_app_feed: preferences.inApp ?? true,
        slack: preferences.slack ?? false,
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    return { success: false, error };
  }
}