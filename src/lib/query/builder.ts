enum Operator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_OR_EQUAL_TO = '>=',
  LESS_THAN_OR_EQUAL_TO = '<=',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  LIKE = 'LIKE',
  NOT_LIKE = 'NOT LIKE',
  IS_NULL = 'IS NULL',
  IS_NOT_NULL = 'IS NOT NULL',
}

export class Filter {
  field: string
  operator: Operator
  value: string | number | boolean
}

export class Sort {
  field: string
  direction: string
}

export class Select {
  field: string
  alias: string
}

export class Query {
  source: string
  filters: Filter[]
  sorts: Sort[]
  selects: Select[]
  groupBy: string[]
  limit: number
  offset: number
}
