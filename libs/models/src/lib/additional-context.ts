export interface AdditionalContext {
  id: string;
  label: string;
}

export function additionalContextToString(data: AdditionalContext): string {
  return `${data.id}:${data.label}`;
}

export function stringToAdditionalContext(
  data: string
): AdditionalContext | null {
  if (!data) {
    return null;
  }

  const parts = data.split(':');
  if (parts.length !== 2) {
    return null;
  }

  return {
    id: parts[0],
    label: parts[1],
  };
}
