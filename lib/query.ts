export function buildQuery(
  current: { [key: string]: string | string[] | undefined },
  overrides: { [key: string]: string | undefined }
): string {
  const merged: { [key: string]: string | string[] | undefined } = { ...current, ...overrides };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => v && params.append(key, v));
    } else {
      params.set(key, value);
    }
  }
  return params.toString();
}
