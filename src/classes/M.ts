// Math stuff

export function randomInt (min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function random (min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min
}
