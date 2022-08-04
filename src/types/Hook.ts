export interface Hook {
  id: string
  name: string
  description?: string
  instances: {
    id: number
    hook_id: number
    instance_id: number
    result: string
  }[]
}
