class DefaultQuizUser {
  constructor(
    public readonly name: string,
    public readonly aliases: string[]
  ) {}
}

export class QuizUsers {
  static readonly defaultUsers: DefaultQuizUser[] = [
    new DefaultQuizUser('Jonas', []),
    new DefaultQuizUser('Dino', []),
    new DefaultQuizUser('Leon', []),
    new DefaultQuizUser('Gabi', []),
    new DefaultQuizUser('Fabian', []),
  ];

  static ParseName(name: string): string | null {
    const lowerCaseName = name.toLowerCase();
    for (const defUser of this.defaultUsers) {
      if (
        defUser.name.toLowerCase() === lowerCaseName ||
        defUser.aliases.some(elem => elem.toLowerCase() === lowerCaseName)
      ) {
        return null;
        // return defUser.name;
      }
    }

    name = name.trim();
    if (name.startsWith('-') || name.startsWith('•')) {
      name = name.substring(1).trim();
    }

    return name;
  }
}
