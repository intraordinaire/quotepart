const PLACEHOLDER_NAMES = ["Alice", "Mehdi", "Sam", "Yasmine", "Jordan", "Léa", "Thomas", "Chloé"];

export function randomPlaceholderPair(): [string, string] {
  const shuffled = [...PLACEHOLDER_NAMES].sort(() => Math.random() - 0.5);
  return [shuffled[0]!, shuffled[1]!];
}

export function displayName(name: string, fallback: "Personne 1" | "Personne 2"): string {
  return name.trim() || fallback;
}
