import * as varint from './varint';

export enum Tag {
  Body = 0,
  Flags = 2,
  Rune = 4,
  Premine = 6,
  Cap = 8,
  Amount = 10,
  HeightStart = 12,
  HeightEnd = 14,
  OffsetStart = 16,
  OffsetEnd = 18,
  Mint = 20,
  Pointer = 22,
  Burn = 126,
  Cenotaph = 126,
  Divisibility = 1,
  Spacers = 3,
  Symbol = 5,
  Nop = 127,
}

export function tagEncoder(tag: bigint, value: bigint, target: number[]): number[] {
  target = varint.encodeToVec(tag, target);
  target = varint.encodeToVec(value, target);
  return target;
}
export function tagEncodeList(tag: bigint, value: bigint[], target: number[]): number[] {
  for (let i = 0; i < value.length; i++) {
    target = varint.encodeToVec(tag, target);
    target = varint.encodeToVec(value[i], target);
  }
  return target;
}

export function tagEncodeOption(tag: bigint, value: bigint | null, target: number[]): number[] {
  if (value !== null) {
    target = tagEncoder(tag, value, target);
  }
  return target;
}

export function tagInto(tag: Tag): bigint {
  return BigInt(tag);
}

// export function tagTaker(tag: bigint, value: bigint, fields: Map<bigint, bigint[]>): bigint | null {
//   const field = fields.get(tag);

//   if (field === undefined) {
//     return null;
//   }

//   fields.delete(tag);

//   field.push(value);

//   return BigInt(field.length);
// }

export function tagTaker<T>(tag: bigint, length: number, fields: Map<bigint, bigint[]>, callback: (value: bigint[]) => T | null): T | null {
  let field = fields.get(tag);

  let values: bigint[] = new Array(length);

  for (let i = 0; i < length; i++) {
    if (field) {
      values[i] = field[i];
    }
  }
  let value = callback(values);

  if (field) {
    drain(field, 0, length);
  }

  if (field && field.length === 0) {
    fields.delete(tag);
  }
  return value;
}

function drain<T>(array: T[], start: number, end: number): T[] {
  // 注意：end 在这里是不包含的，与Rust的行为一致
  // JavaScript 的 splice 方法的第二个参数需要的是删除的元素数量
  // 所以我们需要计算出长度
  const deleteCount = end - start;

  // 使用 splice 来移除元素，它同时返回被移除的元素数组
  return array.splice(start, deleteCount);
}
// pub(super) fn take<const N: usize, T>(
//   self,
//   fields: &mut HashMap<u128, VecDeque<u128>>,
//   with: impl Fn([u128; N]) -> Option<T>,
// ) -> Option<T> {
//   let field = fields.get_mut(&self.into())?;
//   let mut values: [u128; N] = [0; N];
//   for (i, v) in values.iter_mut().enumerate() {
//     *v = *field.get(i)?;
//   }
//   let value = with(values)?;
//   field.drain(0..N);
//   if field.is_empty() {
//     fields.remove(&self.into()).unwrap();
//   }
//   Some(value)
// }
