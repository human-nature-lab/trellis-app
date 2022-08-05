export interface Hook {
  id: string
  name: string
  icon?: string
  description?: string
  geoTypeId?: string
  instances: {
    id: number
    hook_id: number
    instance_id: number
    result: string
  }[]
}
