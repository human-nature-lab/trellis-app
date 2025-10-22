import { Random, JSF32bSource } from '../../src/lib/random/random'
import { writeFileSync } from 'fs'

function writeBinary (filename: string, prng: { random (): number }, size: number) {
  const bytes = Buffer.alloc(size)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(prng.random() * 256)
  }
  writeFileSync(filename, bytes)
}

writeBinary('jsf32b.bin', new Random(new JSF32bSource(Math.random())), 100_000_000)
