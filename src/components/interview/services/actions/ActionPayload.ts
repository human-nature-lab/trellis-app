export type ActionPayload = {
  val: string
  name: string
  sort_order?: number
  random_sort_order?: number
} & ({ dk_rf: boolean, dk_rf_val: string }
| { choice_id: string } | { roster_id: string } | { geo_id: string } | { edge_id: string } | { photo_id: string }
| { datum_id: string } | { respondent_geo_id: string } | { respondent_name_id: string } | { asset_id: string })
| { edge_id: string }
