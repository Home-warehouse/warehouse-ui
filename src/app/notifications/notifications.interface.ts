const notificationsDict = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
};

export type NotificationsType = keyof typeof notificationsDict;

export interface NotificationParameters {
  message: string;
  type: NotificationsType;
  timeout?: number;
}
