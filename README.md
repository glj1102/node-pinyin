# node-pinyin

For transform chinese to pinyin

## install

npm install ts-pinyin --save

## USE

1.

```
import { Pinyin } from "ts-pinyin"
const pinyin = new Pinyin();
const pinyinVectors = pinyin.lookup(input);
pinyinVectors is Array for pinyin
```

2.

```
import { convertToPinyin } from "ts-pinyin";
const pinyinString = convertToPinyin(input);
pinyinString is String for pinyin
```
