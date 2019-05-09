"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by avastms on 15/10/28.
 */
const lodash_1 = __importDefault(require("lodash"));
const fs = require("fs");
const FLAG_FIRST_LETTER = parseInt("0001", 2);
const FLAG_PHONETIC = parseInt("0010", 2);
const FLAG_LETTERS = parseInt("0100", 2);
const FLAG_LETTERS_WITH_TONE = parseInt("1000", 2);
const FLAG_ALL = parseInt("1111", 2);
const FLAG_MINT = FLAG_LETTERS | FLAG_FIRST_LETTER;
const MAP_PHONETIC_LETTER_AND_TONE = {
  ā: "a1",
  á: "a2",
  ǎ: "a3",
  à: "a4",
  ē: "e1",
  é: "e2",
  ě: "e3",
  è: "e4",
  ō: "o1",
  ó: "o2",
  ǒ: "o3",
  ò: "o4",
  ī: "i1",
  í: "i2",
  ǐ: "i3",
  ì: "i4",
  ū: "u1",
  ú: "u2",
  ǔ: "u3",
  ù: "u4",
  ü: "v0",
  ǖ: "v1",
  ǘ: "v2",
  ǚ: "v3",
  ǜ: "v4",
  ń: "n2",
  ň: "n3",
  "": "m2"
};
const REVERSED_MAP_PHONETIC_LETTER_AND_TONE = lodash_1.default.invert(
  MAP_PHONETIC_LETTER_AND_TONE
);
const MAP_PHONETIC_YU_PATCH = {
  ü: "yu0",
  ǖ: "yu1",
  ǘ: "yu2",
  ǚ: "yu3",
  ǜ: "yu4"
};
const defaultOptions = {
  polyphones: false,
  separator: "",
  characterDictPath: __dirname + "/source/characters.txt",
  tokenDictPath: __dirname + "/source/tokens.txt"
};
class Pinyin {
  constructor(options) {
    this.options = lodash_1.default.defaults(options || {}, defaultOptions);
    this.compileCharacterDict();
    this.compileTokenDict();
  }
  convertPhoneticForm(phoneticForm) {
    let tone = 0;
    let toneOffset = 0;
    let letterForm;
    letterForm = lodash_1.default
      .map(phoneticForm, function(char, index) {
        const letterV = lodash_1.default.get(
          MAP_PHONETIC_LETTER_AND_TONE,
          char
        );
        if (letterV) {
          tone = parseInt(letterV[letterV.length - 1]);
          toneOffset = index;
          return letterV.substring(0, letterV.length - 1);
        } else {
          return char;
        }
      })
      .join("");
    return letterForm + tone + toneOffset.toString();
  }
  compileCharacterDict() {
    const self = this;
    const compiledDict = [];
    const dictFile = fs.openSync(this.options.characterDictPath, "r");
    const buff = new Buffer(8 * 1024);
    let rawDict = "";
    let bytesRead = 0;
    let finalLineOffset = 0;
    let thisLineOffset = 0;
    let lastLineOffset = 0;
    let theLine = "";
    let dictVector;
    const dropRRegexp = new RegExp("\r", "g");
    bytesRead = fs.readSync(dictFile, buff, 0, buff.length);
    while (bytesRead) {
      rawDict += buff.toString("utf-8", 0, bytesRead);
      finalLineOffset = rawDict.lastIndexOf("\n");
      thisLineOffset = rawDict.indexOf("\n", 0);
      lastLineOffset = -1;
      while (thisLineOffset < finalLineOffset) {
        theLine = rawDict.substring(lastLineOffset + 1, thisLineOffset);
        if (theLine) {
          theLine = theLine.replace(dropRRegexp, "");
        }
        dictVector = theLine.split(",");
        lastLineOffset = thisLineOffset;
        thisLineOffset = rawDict.indexOf("\n", lastLineOffset + 1);
        if (dictVector.length <= 1) {
          continue;
        } else {
          compiledDict[parseInt(dictVector[0], 16)] = lodash_1.default
            .reduce(
              dictVector.slice(1),
              function(final, phoneticForm) {
                final.push(self.convertPhoneticForm(phoneticForm));
                return final;
              },
              []
            )
            .join(",");
        }
      }
      rawDict = rawDict.substring(finalLineOffset + 1, rawDict.length);
      bytesRead = fs.readSync(dictFile, buff, 0, buff.length);
    }
    this.dict = compiledDict;
  }
  compileTokenDict() {
    const self = this;
    const compiledDict = {};
    const dictFile = fs.openSync(this.options.tokenDictPath, "r");
    const buff = new Buffer(8 * 1024);
    // var rawDict = fs.readFileSync(this.options.tokenDictPath, {encoding: "utf-8"});
    let rawDict = "";
    let bytesRead = 0;
    let finalLineOffset = 0;
    let thisLineOffset = 0;
    let lastLineOffset = 0;
    let theLine = "";
    let dictVector;
    const dropRRegexp = new RegExp("\r", "g");
    bytesRead = fs.readSync(dictFile, buff, 0, buff.length);
    while (bytesRead) {
      rawDict += buff.toString("utf-8", 0, bytesRead);
      finalLineOffset = rawDict.lastIndexOf("\n");
      thisLineOffset = rawDict.indexOf("\n", 0);
      lastLineOffset = -1;
      while (thisLineOffset < finalLineOffset) {
        theLine = rawDict.substring(lastLineOffset + 1, thisLineOffset);
        if (theLine) {
          theLine = theLine.replace(dropRRegexp, "");
        }
        dictVector = theLine.split(",");
        lastLineOffset = thisLineOffset;
        thisLineOffset = rawDict.indexOf("\n", lastLineOffset + 1);
        if (dictVector.length < 2) {
          continue;
        } else {
          compiledDict[dictVector[0]] = lodash_1.default
            .reduce(
              dictVector.slice(1),
              function(final, phoneticForm) {
                final.push(self.convertPhoneticForm(phoneticForm));
                return final;
              },
              []
            )
            .join(",");
        }
      }
      rawDict = rawDict.substring(finalLineOffset + 1, rawDict.length);
      bytesRead = fs.readSync(dictFile, buff, 0, buff.length);
    }
    this.tokenDict = compiledDict;
  }
  lookupChar(char) {
    if (!lodash_1.default.isString(char) || char.length !== 1) {
      return undefined;
    }
    const match = this.dict[char.charCodeAt(0)];
    if (match) {
      const wordVRaw = match.split(",");
      if (this.options.polyphones) {
        return wordVRaw;
      } else {
        return [wordVRaw[0]];
      }
    } else {
      return undefined;
    }
  }
  lookupToken(token) {
    const match = this.tokenDict[token];
    if (match) {
      return lodash_1.default.map(match.split(","), function(item) {
        return [item];
      });
    } else {
      return lodash_1
        .default(token)
        .map(x => {
          return this.lookupChar(x);
        })
        .compact()
        .value();
    }
  }
  cartesianProduct(vectorOfVectors) {
    const self = this;
    const finalProduct = lodash_1.default.reduce(
      vectorOfVectors,
      function(acc, wordV, indx) {
        const nextAcc = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < acc.length; i++) {
          // tslint:disable-next-line:prefer-for-of
          for (let j = 0; j < wordV.length; j++) {
            const newV = lodash_1.default.cloneDeep(acc[i]);
            const rawV = wordV[j];
            if (!rawV || !newV) {
              return acc[i];
            }
            const letterForm = rawV.substring(0, rawV.length - 2);
            const specialOffset = parseInt(rawV[rawV.length - 1]);
            const specialLetter =
              REVERSED_MAP_PHONETIC_LETTER_AND_TONE[
                rawV[specialOffset] +
                  rawV.substring(rawV.length - 2, rawV.length - 1)
              ];
            let phoneticForm = "";
            let compoundForm = "";
            if (specialLetter && !lodash_1.default.isNaN(specialOffset)) {
              phoneticForm =
                rawV.substring(0, specialOffset) +
                specialLetter +
                rawV.substring(specialOffset + 1, rawV.length - 2);
              compoundForm = rawV.substring(0, rawV.length - 1);
            } else {
              phoneticForm = letterForm;
              compoundForm = letterForm;
            }
            newV[0].push(rawV[0]);
            newV[1].push(phoneticForm);
            newV[2].push(letterForm);
            newV[3].push();
            nextAcc.push(newV);
          }
        }
        return nextAcc;
      },
      [[[], [], [], []]]
    );
    return lodash_1.default.map(finalProduct, function(item) {
      const firstLetters = item[0].join(self.options.separator);
      const phonetics = item[1].join(self.options.separator);
      const letters = item[2].join(self.options.separator);
      const lettersWithTones = item[3].join(self.options.separator);
      return [firstLetters, phonetics, letters, lettersWithTones];
    });
  }
  firstMatch(vectorOfVectors) {
    const self = this;
    const finalProduct = lodash_1.default.reduce(
      vectorOfVectors,
      function(acc, wordV, indx) {
        const rawV = wordV[0];
        if (!rawV) {
          return acc;
        }
        const letterForm = rawV.substring(0, rawV.length - 2);
        const specialOffset = parseInt(rawV[rawV.length - 1]);
        const specialLetter =
          REVERSED_MAP_PHONETIC_LETTER_AND_TONE[
            rawV[specialOffset] +
              rawV.substring(rawV.length - 2, rawV.length - 1)
          ];
        let phoneticForm = "";
        let compoundForm = "";
        if (specialLetter && !lodash_1.default.isNaN(specialOffset)) {
          phoneticForm =
            rawV.substring(0, specialOffset) +
            specialLetter +
            rawV.substring(specialOffset + 1, rawV.length - 2);
          compoundForm = rawV.substring(0, rawV.length - 1);
        } else {
          phoneticForm = letterForm;
          compoundForm = letterForm;
        }
        acc[0].push(rawV[0]);
        acc[1].push(phoneticForm);
        acc[2].push(letterForm);
        acc[3].push(compoundForm);
        return acc;
      },
      [[], [], [], []]
    );
    return lodash_1.default.map(finalProduct, function(tokenV) {
      return tokenV.join(self.options.separator);
    });
  }
  lookup(token) {
    let tokenVectors;
    if (!lodash_1.default.isString(token)) {
      return [];
    }
    tokenVectors = this.lookupToken(token);
    if (this.options.polyphones) {
      return this.cartesianProduct(tokenVectors);
    } else {
      return this.firstMatch(tokenVectors);
    }
  }
}
exports.Pinyin = Pinyin;
//# sourceMappingURL=pinyin.js.map
