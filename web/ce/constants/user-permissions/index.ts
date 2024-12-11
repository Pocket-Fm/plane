export enum EUserPermissionsLevel {
  WORKSPACE = "WORKSPACE",
  PROJECT = "PROJECT",
}
export type TUserPermissionsLevel = EUserPermissionsLevel;

export enum EUserPermissions {
  ADMIN = 20,
  MEMBER = 15,
  GUEST = 5,
  //added by pocket FM---
  WRITER = 14,
  SE = 13,
  VOA = 12,
  //---------------------
}
export type TUserPermissions = EUserPermissions;

export type TUserAllowedPermissionsObject = {
  create: TUserPermissions[];
  update: TUserPermissions[];
  delete: TUserPermissions[];
  read: TUserPermissions[];
};
export type TUserAllowedPermissions = {
  workspace: {
    [key: string]: Partial<TUserAllowedPermissionsObject>;
  };
  project: {
    [key: string]: Partial<TUserAllowedPermissionsObject>;
  };
};

export const USER_ALLOWED_PERMISSIONS: TUserAllowedPermissions = {
  workspace: {
    dashboard: {
      read: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    },
  },
  project: {},
};
