import JSBI from 'jsbi';

globalThis.JSBI = JSBI;

export type Library = ReturnType<typeof createLibrary>

export const createLibrary = () => {
  const buffer = new ArrayBuffer(8)
  const f32 = new Float32Array(buffer)
  const f64 = new Float64Array(buffer)
  const i32 = new Int32Array(buffer)
  const i64 = new DataView(buffer)
  const u64 = new DataView(buffer)

  return {
    copysign_(x: number, y: number): number {
      return (x < 0 || (x === 0 && Object.is(x, -0))) !== (y < 0 || (y === 0 && Object.is(y, -0))) ? -x : x
    },
    u64_to_s64_(x: JSBI): JSBI {
      JSBI.DataViewSetBigUint64(u64, 0, x)
      return JSBI.DataViewGetBigInt64(i64, 0)
    },
    i32_reinterpret_f32_(x: number): number {
      f32[0] = x
      return i32[0]
    },
    f32_reinterpret_i32_(x: number): number {
      i32[0] = x
      return f32[0]
    },
    i64_reinterpret_f64_(x: number): JSBI {
      f64[0] = x
      return JSBI.DataViewGetBigUint64(u64, 0)
    },
    f64_reinterpret_i64_(x: JSBI): number {
      JSBI.DataViewSetBigUint64(u64, 0, x);
      return f64[0]
    },
    i32_rotl_(x: number, y: number) {
      return x << y | x >>> 32 - y
    },
    i32_rotr_(x: number, y: number) {
      return x >>> y | x << 32 - y
    },
    i64_rotl_(x: JSBI, y: JSBI) {
      // Note: "y" is already "y & 63n" from the caller
      return JSBI.bitwiseAnd(JSBI.bitwiseOr(JSBI.leftShift(x, y), JSBI.signedRightShift(x, JSBI.subtract(JSBI.BigInt(64), y))), JSBI.BigInt('0xFFFFFFFFFFFFFFFF'))
    },
    i64_rotr_(x: JSBI, y: JSBI) {
      // Note: "y" is already "y & 63n" from the caller
      return JSBI.bitwiseAnd((JSBI.bitwiseOr(JSBI.signedRightShift(x, y), JSBI.leftShift(x, JSBI.subtract(JSBI.BigInt(64), y)))), JSBI.BigInt('0xFFFFFFFFFFFFFFFF'))
    },
    i32_ctz_(x: number): number {
      return x ? Math.clz32(x & -x) ^ 31 : 32
    },
    i32_popcnt_(x: number): number {
      let count = 0
      while (x) {
        count++
        x &= x - 1
      }
      return count
    },
    i64_clz_(x: JSBI): JSBI {
      let count = Math.clz32(JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(x, JSBI.BigInt(32)), JSBI.BigInt(0xFFFF_FFFF))))
      if (count === 32) count += Math.clz32(JSBI.toNumber(JSBI.bitwiseAnd(x, JSBI.BigInt(0xFFFF_FFFF))))
      return JSBI.BigInt(count)
    },
    i64_ctz_(x: JSBI): JSBI {
      let y = JSBI.toNumber(JSBI.bitwiseAnd(x, JSBI.BigInt(0xFFFF_FFFF)))
      if (y) return JSBI.BigInt(Math.clz32(y & -y) ^ 31)
      y = JSBI.toNumber(JSBI.bitwiseAnd(JSBI.signedRightShift(x, JSBI.BigInt(32)), JSBI.BigInt(0xFFFF_FFFF)))
      return y ? JSBI.BigInt(32 + Math.clz32(y & -y) ^ 31) : JSBI.BigInt(64)
    },
    i64_popcnt_(x: JSBI): JSBI {
      let count = JSBI.BigInt(0)
      while (x) {
        count = JSBI.add(count, JSBI.BigInt(1))
        x = JSBI.bitwiseAnd(x, JSBI.subtract(x, JSBI.BigInt(1)))
      }
      return count
    },
    i32_trunc_sat_s_(x: number): number {
      x = Math.trunc(x)
      return x >= 0x7FFF_FFFF ? 0x7FFF_FFFF :
        x <= -0x8000_0000 ? -0x8000_0000 :
          x | 0
    },
    i32_trunc_sat_u_(x: number): number {
      x = Math.trunc(x)
      return x >= 0xFFFF_FFFF ? -1 :
        x <= 0 ? 0 :
          x | 0
    },
    i64_trunc_sat_s_(x: number): JSBI {
      x = Math.trunc(x)
      return JSBI.GE(JSBI.BigInt(x), JSBI.BigInt('0x7FFFFFFFFFFFFFFF')) ? JSBI.BigInt('0x7FFFFFFFFFFFFFFF') :
        JSBI.LE(JSBI.BigInt(x), JSBI.unaryMinus(JSBI.BigInt('0x8000000000000000'))) ? JSBI.BigInt('0x8000000000000000') :
          x === x ?
            JSBI.bitwiseAnd(JSBI.BigInt(x), JSBI.BigInt('0xFFFFFFFFFFFFFFFF')) :
            JSBI.BigInt(0) // NaN must become 0
    },
    i64_trunc_sat_u_(x: number): JSBI {
      x = Math.trunc(x)
      return JSBI.GE(JSBI.BigInt(x), JSBI.BigInt('0xFFFFFFFFFFFFFFFF')) ? JSBI.BigInt('0xFFFFFFFFFFFFFFFF') :
        !(x > 0) ? JSBI.BigInt(0) : // NaN must become 0
        JSBI.BigInt(x)
    },
    i64_extend8_s_(x: JSBI): JSBI {
      return JSBI.bitwiseAnd(x, JSBI.BigInt(0x80)) ? JSBI.bitwiseOr(x, JSBI.BigInt('0xFFFFFFFFFFFFFF00')) : JSBI.bitwiseAnd(x, JSBI.BigInt(0xFF))
    },
    i64_extend16_s_(x: JSBI): JSBI {
      return JSBI.bitwiseAnd(x, JSBI.BigInt(0x8000)) ? JSBI.bitwiseOr(x, JSBI.BigInt('0xFFFFFFFFFFFF0000')) : JSBI.bitwiseAnd(x, JSBI.BigInt(0xFFFF))
    },
    i64_extend32_s_(x: JSBI): JSBI {
      return JSBI.bitwiseAnd(x, JSBI.BigInt(0x80000000)) ? JSBI.bitwiseOr(x, JSBI.BigInt('0xFFFFFFFF00000000')) : JSBI.bitwiseAnd(x, JSBI.BigInt(0xFFFFFFFF))
    },
  }
}
