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
      expect(serialize(undefined)).toBe('["{#$_u}"]');
    });
    it('can serialize null', () => {
      expect(serialize(null)).toBe('[null]');
    });
    it('can serialize symbol', () => {
      expect(serialize(Symbol.for('foo'))).toBe('["{#$_s:foo}"]');
    });
    it('can serialize simple objects', () => {
      expect(serialize({foo: 'bar'})).toBe('[{"foo":"1"},"bar"]');
    });
    it('can serialize BigInt', () => {
      expect(serialize(BigInt(1234))).toBe('["{#$_B:1234}"]');
    });
  });

  it('can serialize Infinities', () => {
    expect(serialize(Infinity)).toBe('["{#$_inf:+}"]');
    expect(serialize(-Infinity)).toBe('["{#$_inf:-}"]');
  });

  it('can serialize Date', () => {
    expect(serialize(new Date('2024-09-01T04:12:39.730Z'))).toBe(
      '["{#$_D:2024-09-01T04:12:39.730Z}"]',
    );
  });

  it('can serialize Map', () => {
    const collection = new Map();
    collection.set('foo', 'bar');
    collection.set('baz', 'goo');
    expect(serialize(collection)).toBe(
      '["{#$_M:[[\\"1\\",\\"2\\"],[\\"3\\",\\"4\\"],[\\"5\\",\\"6\\"],\\"foo\\",\\"bar\\",\\"baz\\",\\"goo\\"]}"]',
    );
  });

  it('can serialize URL', () => {
    expect(serialize(new URL('http://example.foo'))).toBe('["{#$_L:http%3A%2F%2Fexample.foo%2F}"]');
  });

  it('can serialize Set', () => {
    const collection = new Set();
    collection.add('foo');
    collection.add('bar');
    expect(serialize(collection)).toBe('["{#$_S:[[\\"1\\",\\"2\\"],\\"foo\\",\\"bar\\"]}"]');
  });

  it('can serialize Regex', () => {
    const regex = new RegExp('foo\\}\\{bar\\}', 'g');
    expect(serialize(regex)).toBe('["{#$_R:foo\\\\}\\\\{bar\\\\}}g"]');
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
      '["{#$_C:User}[[\\"1\\",25],\\"john\\"]"]',
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

  it('can serialize objects with symbol properties', () => {
    const obj = {
      [Symbol.for('foo')]: {
        [Symbol.for('bar')]: 'baz',
      },
    };
    expect(serialize(obj)).toBe('[{"{#$_s:foo}":"1"},{"{#$_s:bar}":"2"},"baz"]');
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
    it('can deserialize strings', () => {
      expect(deserialize('["hello"]')).toBe('hello');
    });
    it('can deserialize numbers', () => {
      expect(deserialize('[1234]')).toBe(1234);
    });
    it('can deserialize booleans', () => {
      expect(deserialize('[true]')).toBe(true);
      expect(deserialize('[false]')).toBe(false);
    });
    it('can deserialize undefined', () => {
      expect(deserialize('["{#$_u}"]')).toBe(undefined);
    });
    it('can deserialize null', () => {
      expect(deserialize('[null]')).toBe(null);
    });
    it('can deserialize symbol', () => {
      expect(deserialize('["{#$_s:foo}"]')).toEqual(Symbol.for('foo'));
    });

    it('can deserialize simple objects', () => {
      expect(deserialize('[{"foo":"1"},"bar"]')).toEqual({foo: 'bar'});
    });

    it('can deserialize BigInt', () => {
      expect(deserialize('["{#$_B:1234}"]')).toEqual(BigInt(1234));
      expect(deserialize('["{#$_B:1234}"]')).not.toEqual(BigInt(4321));
    });
  });

  it('can deserialize Infinities', () => {
    expect(deserialize('["{#$_inf:+}"]')).toBe(Infinity);
    expect(deserialize('["{#$_inf:-}"]')).toBe(-Infinity);
  });

  it('can deserialize Date', () => {
    expect(deserialize('["{#$_D:2024-09-01T04:12:39.730Z}"]')).toEqual(
      new Date('2024-09-01T04:12:39.730Z'),
    );
  });

  it('can deserialize Map', () => {
    const collection = new Map();
    collection.set('foo', 'bar');
    collection.set('baz', 'goo');
    expect(
      deserialize(
        '["{#$_M:[[\\"1\\",\\"2\\"],[\\"3\\",\\"4\\"],[\\"5\\",\\"6\\"],\\"foo\\",\\"bar\\",\\"baz\\",\\"goo\\"]}"]',
      ),
    ).toEqual(collection);
  });

  it('can deserialize Set', () => {
    const collection = new Set();
    collection.add('foo');
    collection.add('bar');
    expect(deserialize('["{#$_S:[[\\"1\\",\\"2\\"],\\"foo\\",\\"bar\\"]}"]')).toEqual(collection);
  });

  it('can deserialize URL', () => {
    expect(deserialize('["{#$_L:http%3A%2F%2Fexample.foo%2F}"]')).toEqual(
      new URL('http://example.foo'),
    );
  });

  it('can deserialize Regex', () => {
    const regex = new RegExp('foo\\}\\{bar\\}', 'g');
    expect(deserialize('["{#$_R:foo\\\\}\\\\{bar\\\\}}g"]')).toEqual(regex);
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
    const deserializedUser: User = deserialize('["{#$_C:User}[[\\"1\\",25],\\"john\\"]"]', {
      User,
    });

    expect(deserializedUser instanceof User).toBe(true);
    expect(deserializedUser.age).toBe(25);
    expect(deserializedUser.name).toBe('john');
  });

  it('can deserialize objects with symbol properties', () => {
    const obj = {
      [Symbol.for('foo')]: {
        [Symbol.for('bar')]: 'baz',
      },
    };
    expect(deserialize('[{"{#$_s:foo}":"1"},{"{#$_s:bar}":"2"},"baz"]')).toEqual(obj);
  });
});
