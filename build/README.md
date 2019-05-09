# node-pinyin

For transform chinese to pinyin

## install

npm install node-pinyin --save

## USE

1.

```
import { Pinyin } from "node-pinyin"
const pinyin = new Pinyin();
const pinyinVectors = pinyin.lookup(input);
pinyinVectors is Array for pinyin
```

2.

```
import { convertToPinyin } from "node-pinyin";
const pinyinString = convertToPinyin(input);
pinyinString is String for pinyin
```
