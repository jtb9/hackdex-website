export function calculateLikelyRomMatch(
  fileName: string,
  romNames: Array<{ id: string; name: string }>
): string | null {
  const cleanFileName = stripPokemonAndClean(fileName);
  
  if (!cleanFileName) return null;

  const fileWords = cleanFileName.split(" ");

  let bestMatch: { id: string; name: string } | null = null;
  let bestMatchCount = 0;

  for (const rom of romNames) {
    const cleanRomName = stripPokemonAndClean(rom.name);
    const romWords = cleanRomName.split(" ");

    let matchCount = 0;
    for (const fileWord of fileWords) {
      if (romWords.some((romWord) => romWord.toLowerCase() === fileWord.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestMatch = rom;
    }
  }

  return bestMatchCount > 0 ? bestMatch?.id ?? null : null;
}

function stripPokemonAndClean(text: string): string {
  return text
    .replace(/pokemon/gi, "")
    .replace(/\.[^.]*$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

