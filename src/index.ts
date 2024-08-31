/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {parse, stringify} from 'flatted';

export {parse as flattedParse, stringify as flattedStringify};

export type JSONSerializable = {toJSON: () => string};
export interface JSONSerializableClass {
  new (...any: any[]): JSONSerializable;
  fromJSON: (json: string) => any;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type ClassRecord = Record<string, Function & JSONSerializableClass>;

function getClassKey(item: any, classRevivers: ClassRecord) {
  return (
    Object.keys(classRevivers).find(key => item instanceof classRevivers[key]) ||
    item.constructor.name
  );
}

function customReplacer(
  this: Record<string, any> | undefined,
  _key: string,
  value: unknown,
): unknown {
  if (typeof value === 'undefined') {
    return {$$_u: 1};
  }
  if (typeof value === 'bigint') {
    return value.toString() + 'n';
  }
  if (typeof value === 'symbol') {
    return {$$_s: value.toString().slice(7, -1)};
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    this &&
    typeof (value as Partial<JSONSerializable>)['toJSON'] === 'function'
  ) {
    const classKey = getClassKey(value, this);
    if (classKey) {
      return {$$_c: classKey, $$_v: (value as JSONSerializable).toJSON()};
    }
  }
  return value;
}

function customReviver(this: ClassRecord | undefined, _key: string, value: any): unknown {
  if (value === null) return null;
  if (typeof value === 'string' && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  if (typeof value === 'object') {
    if (typeof value.$$_s === 'string') {
      return Symbol.for(value.$$_s as string);
    }
    if (value.$$_u) {
      return undefined;
    }
    if (value.$$_c && typeof value.$$_v === 'string' && this) {
      const classKey = getClassKey({constructor: {name: value.$$_c}}, this);
      if (classKey) {
        return this[classKey].fromJSON(value.$$_v as string);
      }
    }
  }
  return value;
}

export function serialize(input: unknown, classes?: ClassRecord) {
  return stringify(input, customReplacer.bind(classes));
}

export function deserialize(input: string, classes?: ClassRecord) {
  return parse(input, customReviver.bind(classes));
}
