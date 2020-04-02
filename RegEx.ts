import { readFileSync } from "fs";

const LINE_SEPARATOR = process.env.IFS || "\n";
const GROUP_SEPARATOR = process.env.RE_IFS || "\t";

enum Flag { EXECUTE = "e", FILE = "f" }

class RegEx {
  private readonly flags: string;
  private readonly regularExpression: RegExp;
  private readonly content: string;

  constructor() {
    const [flags, regularExpressionString, contentString] = this.parseArguments();

    this.flags = flags;
    this.regularExpression = this.parseRegularExpression(regularExpressionString);
    this.content = this.getContent(contentString);
  }

  private parseArguments(): string[] {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      this.exit(false);
    }

    const [flagsArgument, regularExpressionArgument] = args;

    if (flagsArgument.startsWith("-")) {
      return args;
    }

    return ["-", flagsArgument, regularExpressionArgument];
  }

  private parseRegularExpression(expressionString): RegExp | null {
    const expressionRegEx = /^\/(.+?)\/(\w+)?$/;
    const groups = expressionRegEx.exec(expressionString);

    if (!groups) { return null; }

    const [expression, flags] = groups.slice(1);

    return new RegExp(expression, flags);
  }

  private getContent(contentString: string): string {
    const content = contentString || this.getInputContent();

    if (this.flags.includes(Flag.FILE)) {
      return this.getFileContent(content);
    }

    return content;
  }

  private getInputContent(): string {
    return readFileSync(0, "utf-8")
  }

  private getFileContent(filename: string): string {
    return readFileSync(filename, "utf-8");
  }

  private executeRegularExpression(): string[][] {
    const matches: string[][] = [];
    let match;

    do {
      match = this.regularExpression.exec(this.content)?.slice(1);

      if (match) {
        matches.push(match);
      }
    } while(match && this.regularExpression.global);

    return matches;
  }

  private testRegularExpression(): boolean {
    return this.regularExpression.test(this.content);
  }

  public run(): void {
    const execute = this.flags.includes(Flag.EXECUTE);
    const matches = execute ? this.executeRegularExpression() : this.testRegularExpression();

    if (Array.isArray(matches)) {
      this.printMatches(matches);
      this.exit(matches.length > 0);
    } else {
      this.exit(matches);
    }
  }

  private printMatches(matches: string[][]): void {
    const matchesString = matches
      .map((match) => match.join(GROUP_SEPARATOR))
      .join(LINE_SEPARATOR);

    console.log(matchesString);
  }

  private exit(success: boolean): void {
    process.exit(success ? 0 : 1);
  }
}

new RegEx().run();
