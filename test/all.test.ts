import {serialize, deserialize} from '@/index';
import {parse, stringify} from 'flatted';

describe('serialize', () => {
  it("does not change flatten stringify's behavior for number, string, null and boolean", () => {
    expect(stringify(1234)).toEqual(serialize(1234));
    expect(stringify('foo')).toEqual(serialize('foo'));
    expect(stringify(null)).toEqual(serialize(null));
    expect(stringify(true)).toEqual(serialize(true));
    expect(stringify(false)).toEqual(serialize(false));
  });

  describe('can serialize all primitives', () => {
    it('can serialize strings', () => {
      expect(serialize('hello')).toBe('["hello"]');
    });
    it('can serialize numbers', () => {
      expect(serialize(1234)).toBe('[1234]');
    });
    it('can serialize booleans', () => {
      expect(serialize(true)).toBe('[true]');
      expect(serialize(false)).toBe('[false]');
    });
    it('can serialize undefined', () => {
      expect(serialize(undefined)).toBe('[{"$$_u":1}]');
    });
    it('can serialize null', () => {
      expect(serialize(null)).toBe('[null]');
    });
    it('can serialize symbol', () => {
      expect(serialize(Symbol.for('foo'))).toBe('[{"$$_s":"1"},"foo"]');
    });

    it('can serialize simple objects', () => {
      expect(serialize({foo: 'bar'})).toBe('[{"foo":"1"},"bar"]');
    });
  });

  it('can serialize BigInt', () => {
    expect(serialize(BigInt(1234))).toBe('[{"$$_n":"1"},"1234"]');
  });

  it('can serialize class in a special way when provided', () => {
    class User {
      constructor(
        public name: string,
        public age: number,
      ) {}
      toJSON() {
        return stringify([this.name, this.age]);
      }
      static fromJSON(json: string) {
        const [name, age] = parse(json);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return new User(name, age);
      }
    }
    expect(serialize(new User('john', 25), {User})).toBe(
      '[{"$$_c":"1","$$_v":"2"},"User","[[\\"1\\",25],\\"john\\"]"]',
    );
  });

  it('skips serializing class when not providing the class', () => {
    class User {
      constructor(
        public name: string,
        public age: number,
      ) {}
    }
    expect(serialize(new User('john', 25))).toBe('[{"name":"1","age":25},"john"]');
  });
});

describe('deserialize', () => {
  it("does not change flatten stringify's behavior for number, string, null and boolean", () => {
    expect(parse(stringify(1234))).toEqual(deserialize(serialize(1234)));
    expect(parse(stringify('foo'))).toEqual(deserialize(serialize('foo')));
    expect(parse(stringify(null))).toEqual(deserialize(serialize(null)));
    expect(parse(stringify(true))).toEqual(deserialize(serialize(true)));
    expect(parse(stringify(false))).toEqual(deserialize(serialize(false)));
  });

  describe('can deserialize all primitives', () => {
    it('can serialize strings', () => {
      expect(deserialize('["hello"]')).toBe('hello');
    });
    it('can serialize numbers', () => {
      expect(deserialize('[1234]')).toBe(1234);
    });
    it('can serialize booleans', () => {
      expect(deserialize('[true]')).toBe(true);
      expect(deserialize('[false]')).toBe(false);
    });
    it('can serialize undefined', () => {
      expect(deserialize('[{"$$_u":1}]')).toBe(undefined);
    });
    it('can serialize null', () => {
      expect(deserialize('[null]')).toBe(null);
    });
    it('can serialize symbol', () => {
      expect(deserialize('[{"$$_s":"1"},"foo"]')).toEqual(Symbol.for('foo'));
    });

    it('can serialize simple objects', () => {
      expect(deserialize('[{"foo":"1"},"bar"]')).toEqual({foo: 'bar'});
    });
  });

  it('can deserialize BigInt', () => {
    expect(deserialize('[{"$$_n":"1"},"1234"]')).toEqual(BigInt(1234));
    expect(deserialize('[{"$$_n":"1"},"1234"]')).not.toEqual(BigInt(4321));
  });

  it('can deserialize class in a special way when provided', () => {
    class User {
      constructor(
        public name: string,
        public age: number,
      ) {}
      toJSON() {
        return stringify([this.name, this.age]);
      }
      static fromJSON(json: string) {
        const [name, age] = parse(json);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return new User(name, age);
      }
    }
    const deserializedUser: User = deserialize(
      '[{"$$_c":"1","$$_v":"2"},"User","[[\\"1\\",25],\\"john\\"]"]',
      {User},
    );

    expect(deserializedUser instanceof User).toBe(true);
    expect(deserializedUser.age).toBe(25);
    expect(deserializedUser.name).toBe('john');
  });
});
