import { Pinyin } from "./pinyin";

const convertToPinyin = function(value: string): string {
  const pyInstance = new Pinyin();
  const pinyinVectors = pyInstance.lookup(value);
  if (pinyinVectors[0] && pinyinVectors[2]) {
    return pinyinVectors[0] + "," + pinyinVectors[2];
  } else {
    return "";
  }
};

export { Pinyin, convertToPinyin };
