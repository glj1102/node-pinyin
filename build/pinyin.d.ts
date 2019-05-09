declare class Pinyin {
  private options;
  private dict;
  private tokenDict;
  constructor(options?: any);
  private convertPhoneticForm;
  compileCharacterDict(): void;
  compileTokenDict(): void;
  private lookupChar;
  private lookupToken;
  private cartesianProduct;
  private firstMatch;
  lookup(token: string): any[];
}
export { Pinyin };
