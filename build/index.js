"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinyin_1 = require("./pinyin");
exports.Pinyin = pinyin_1.Pinyin;
const convertToPinyin = function(value) {
  const pyInstance = new pinyin_1.Pinyin();
  const pinyinVectors = pyInstance.lookup(value);
  if (pinyinVectors[0] && pinyinVectors[2]) {
    return pinyinVectors[0] + "," + pinyinVectors[2];
  } else {
    return "";
  }
};
exports.convertToPinyin = convertToPinyin;
//# sourceMappingURL=index.js.map
