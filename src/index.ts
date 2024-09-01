/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {parse, stringify} from 'flatted';

export type JSONSerializable = {toJSON: () => string};
export interface JSONSerializableClass {
  new (...any: any[]): JSONSerializable;
  fromJSON: (json: string) => any;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type ClassRecord = Record<string, Function & JSONSerializableClass>;

function getClassKey(item: any, classRevivers: ClassRecord): string {
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
  if (value === null) return null;
  if (typeof value === 'undefined') {
    return '{#$_u}';
  }
  if (typeof value === 'number' && !Number.isNaN(value) && !Number.isFinite(value)) {
    return `{#$_inf:${value > 0 ? '+' : '-'}}`;
  }
  if (typeof value === 'bigint') {
    return `{#$_B:${value.toString()}}`;
  }
  if (typeof value === 'symbol') {
    return `{#$_s:${value.toString().slice(7, -1)}}`;
  }
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return `{#$_D:${value.toISOString()}}`;
    }
    if (value instanceof Map) {
      return `{#$_M:${serialize(Array.from(value.entries()))}}`;
    }
    if (value instanceof Set) {
      return `{#$_S:${serialize(Array.from(value))}}`;
    }
    if (value instanceof URL) {
      return `{#$_L:${encodeURIComponent(value.toString())}}`;
    }
    if (value instanceof RegExp) {
      return `{#$_R:${value.source}}${value.flags}`;
    }
    if (this && typeof (value as Partial<JSONSerializable>)['toJSON'] === 'function') {
      const classKey = getClassKey(value, this);
      if (classKey) {
        return `{#$_C:${classKey}}{#$_v:${(value as JSONSerializable).toJSON()}}`;
      }
    }
    const symbols = Object.getOwnPropertySymbols(value);
    if (symbols.length) {
      const obj: Record<string | symbol, any> = {...value};
      for (const sym of symbols) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete obj[sym as keyof typeof obj];
        obj[`{#$_s:${sym.toString().slice(7, -1)}}`] = value[sym as keyof typeof value];
      }
      return obj;
    }
  }
  return value;
}

function customReviver(this: ClassRecord | undefined, _key: string, value: any): unknown {
  if (value === null) return null;
  if (value === '{#$_u}') return undefined;
  if (typeof value === 'string') {
    if (value.indexOf('{#$_inf:') === 0) {
      return value[8] === '+' ? Infinity : -Infinity;
    }
    if (value.indexOf('{#$_B:') === 0) {
      return BigInt(value.slice(6, -1));
    }
    if (value.indexOf('{#$_s:') === 0) {
      return Symbol.for(value.slice(6, -1));
    }
    if (value.indexOf('{#$_C:') === 0) {
      const classKey = value.slice(6, value.indexOf('}'));
      if (this) {
        return this[classKey].fromJSON(value.slice(value.indexOf('}') + 7, -1));
      }
    }
    if (value.indexOf('{#$_D:') === 0) {
      return new Date(value.slice(6, -1));
    }
    if (value.indexOf('{#$_M:') === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return new Map(deserialize(value.slice(6, -1)));
    }
    if (value.indexOf('{#$_S:') === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return new Set(deserialize(value.slice(6, -1)));
    }
    if (value.indexOf('{#$_L:') === 0) {
      return new URL(decodeURIComponent(value.slice(6, -1)));
    }
    if (value.indexOf('{#$_R') === 0) {
      return new RegExp(
        value.slice(6, value.lastIndexOf('}')),
        value.slice(value.lastIndexOf('}') + 1),
      );
    }
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value as object);
    for (const key of keys) {
      if (key.indexOf('{#$_s:') === 0) {
        const sym = Symbol.for(key.slice(6, -1));
        value[sym] = value[key];
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete value[key];
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
