# The serializer

a certain specific JSON stringifier that supports `BigInt` and `Symbol` and `undefined`, and can possibly stringify your classes and revive them after parsing.

## Usage

```bash
pnpm install the-serializer
```

```ts
import {serialize, deserialize, flattedParse, flattedStringify} from "the-serializer";

deserialize(serialize(BigInt(10))) === BigInt(10)

// more advanced

// to use class serialization and revival you need to implement `toJSON` and `fromJSON`
// in your class, and pass your class to serialize and deserialize

class User {
  constructor(
    public name: string,
    public age: number,
  ) {}

  toJSON() {
    return flattedStringify([this.name, this.age]);
  }

  static fromJSON(json: string) {
    const [name, age] = flattedParse(json);
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
