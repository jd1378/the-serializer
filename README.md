# The serializer

a certain specific JSON stringifier that supports `BigInt` and `Symbol` and `undefined`, and can possibly stringify your classes and revive them after parsing.

## Usage

```bash
pnpm install the-serializer
```

```ts
import {serialize, deserialize} from "the-serializer";

deserialize(serialize(BigInt(10))) === BigInt(10)

// more advanced

class User {
  constructor(
    public name: string,
    public age: number,
  ) {}
  // important for serialization
  toJSON() {
    return stringify([this.name, this.age]);
  }
  // important for serialization
  static fromJSON(json: string) {
    const [name, age] = parse(json);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return new User(name, age);
  }
}

const str = serialize(new User('john', 25), {User}); 

console.log(str); // '[{"$$_c":"1","$$_v":"2"},"User","[[\\"1\\",25],\\"john\\"]"]'

const deserializedUser = deserialize(str, {User});

console.log(deserializedUser instanceof User); // true
```

## Credits

uses [flatted](https://www.npmjs.com/package/flatted) under the hood to handle circular references.
