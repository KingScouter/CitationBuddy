export class ParsedQuote {
  constructor(
    public readonly fullMessage: string,
    public readonly message: string,
    public readonly person: string,
    public readonly year: string,
    public readonly suffix: string
  ) {}

  static parse(message: string): ParsedQuote | null {
    const quoteRegex = /((?:.*\n)+)(?:\s*.\s*)(.*),\s*(\d+),?\s*(.*)/gms;
    const regexRes = quoteRegex.exec(message);
    if (!regexRes) {
      return null;
    }

    const parsedQuote = new ParsedQuote(
      message,
      regexRes[1],
      regexRes[2],
      regexRes[3],
      regexRes[4] ?? ''
    );

    return parsedQuote;
  }

  toAnonymString(): string {
    let message = `\`\`\`${this.message}\n- ?, ${this.year}`;
    if (this.suffix) {
      message += `, ${this.suffix}`;
    }
    message += '```';

    return message;
  }
}
