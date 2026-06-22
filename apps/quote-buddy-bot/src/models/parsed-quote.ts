export class ParsedQuote {
  constructor(
    public readonly fullMessage: string,
    public readonly message: string,
    public readonly person: string,
    public readonly year: string,
    public readonly suffix: string,
    public readonly url: string,
    public readonly author: string,
    public readonly id: string
  ) {}

  static parse(
    message: string,
    url: string,
    author: string,
    id: string
  ): ParsedQuote | null {
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
      regexRes[4] ?? '',
      url,
      author,
      id
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

  getLink(): string {
    return `[Original](${this.url})`;
  }
}
