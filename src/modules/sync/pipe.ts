import { AsyncHook } from '@/classes/Hook'

type Exec<In, Out, CtrlType> = (input: In, ctrlData?: CtrlType) => Out | Promise<Out>

export class Segment<In, Out, CtrlType, SegType> {
  next?: Segment<Out, any, CtrlType, SegType>
  constructor (public execute: (input: In, data?: CtrlType) => Out | Promise<Out>, public segmentData?: SegType) {}
  then<NextOut> (next: Exec<Out, NextOut, CtrlType>, segmentData?: SegType): Segment<Out, NextOut, CtrlType, SegType> {
    const segment = new Segment(next, segmentData)
    this.next = segment
    return segment
  }
}

export class Pipeline<In, Out, CtrlType, SegType> {
  private first: Segment<In, any, CtrlType, SegType>
  public beforeEach = new AsyncHook()
  public afterEach = new AsyncHook()
  public onError = new AsyncHook()

  public clearHooks () {
    this.beforeEach.clear()
    this.afterEach.clear()
    this.onError.clear()
  }

  async run<T> (input: In, data: CtrlType) {
    let s = this.first
    let i = 0
    let output: T
    while (s) {
      await this.beforeEach.emit(input, i)
      try {
        output = await s.execute(input, data)
        await this.afterEach.emit(input, output, i)
        input = output
      } catch (err) {
        await this.onError.emit(err, i)
        throw err
      }
      s = s.next
      i++
    }
    return output
  }

  async *runGen (input: In, data: CtrlType) {
    let s = this.first
    let i = 0
    while (s) {
      await this.beforeEach.emit(input, i)
      try {
        const output = await s.execute(input, data)
        await this.afterEach.emit(input, output, i)
        yield output
        input = output
      } catch (err) {
        await this.onError.emit(err, i)
        throw err
      }
      s = s.next
      i++
    }
  }

  public then<Out> (next: Exec<In, Out, CtrlType>, segmentData?: SegType): Segment<In, Out, CtrlType, SegType> {
    const segment = new Segment(next, segmentData)
    this.first = segment
    return segment
  }

  public segments (): Segment<any, any, CtrlType, SegType>[] {
    const segments = []
    let s = this.first
    while (s) {
      segments.push(s)
      s = s.next
    }
    return segments
  }
}
