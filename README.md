# The serializer

a certain specific JSON stringifier that supports `BigInt` and `Symbol` and `undefined`, and can possibly stringify your classes and revive them after parsing.

## Usage

```bash
pnpm install the-serializer
```

```ts
import {serialize, deserialize} from "the-serializer";

deserialize(serialize(BigInt(10))) === BigInt(10)

```

## Credits

uses [flatted](https://www.npmjs.com/package/flatted) under the hood to handle circular references.
