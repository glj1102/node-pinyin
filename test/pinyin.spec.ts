import { Pinyin, convertToPinyin } from "../src";
import { assert } from "chai";

describe("pinyin", () => {
  let pyInstance;
  const input = "中国好声音";
  const value1 = "zghsy";
  const value2 = "zhongguohaoshengyin";

  beforeEach(() => {
    pyInstance = new Pinyin();
  });

  it("translate", async () => {
    const pinyinVectors = pyInstance.lookup(input);
    if (pinyinVectors[0] && pinyinVectors[2]) {
      assert.equal(pinyinVectors[0], value1);
      assert.equal(pinyinVectors[2], value2);
    }
  });

  it("use convertToPinyin translate", async () => {
    const pinyinString = convertToPinyin(input);
    assert.equal(pinyinString, `${value1},${value2}`);
  });
});
