export enum TrellisPermission {
  DELETE_RESPONDENT,
  CREATE_RESPONDENT,
  CREATE_OTHER_RESPONDENT,
  CHANGE_RESPONDENT_GEO_CURRENT,
  CREATE_STUDY,
  ADD_USER,
  EDIT_GEO
}

export enum TrellisRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  SURVEYOR = 'SURVEYOR'
}

const defaultPermissions: PermissionMap = {
  [TrellisPermission.DELETE_RESPONDENT]: false,
  [TrellisPermission.CREATE_RESPONDENT]: false,
  [TrellisPermission.CREATE_OTHER_RESPONDENT]: true,
  [TrellisPermission.CHANGE_RESPONDENT_GEO_CURRENT]: false,
  [TrellisPermission.CREATE_STUDY]: false,
  [TrellisPermission.ADD_USER]: false,
  [TrellisPermission.EDIT_GEO]: false
}

export type PermissionMap = {
  [key in TrellisPermission]: boolean
}

export default defaultPermissions
