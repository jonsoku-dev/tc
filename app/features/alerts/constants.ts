export const ALERT_TYPE = {
    SYSTEM_NOTIFICATION: "SYSTEM_NOTIFICATION",
} as const;

export const ALERT_TYPE_LABELS = {
    [ALERT_TYPE.SYSTEM_NOTIFICATION]: "시스템 알림",
} as const;

export const ALERT_STATUS = {
    UNREAD: "UNREAD",
    READ: "READ",
    ARCHIVED: "ARCHIVED",
} as const;

export const ALERT_STATUS_LABELS = {
    [ALERT_STATUS.UNREAD]: "읽지 않음",
    [ALERT_STATUS.READ]: "읽음",
    [ALERT_STATUS.ARCHIVED]: "보관됨",
} as const; 