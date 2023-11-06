export const waitTimeout = async (delay: number) => {
  return await new Promise((resolve) => setTimeout(resolve, delay));
};

export function calculateProgress(totalCount: number): () => number {
  let progress = 0;
  return () => {
    const trueProgress = (++progress / totalCount) * 100;
    return Math.round(trueProgress);
  };
}

export function convertAbbreviatedNumber(str: string) {
  const numberPart = parseFloat(str);
  if (str.toUpperCase().includes("M")) {
    return numberPart * 1000000;
  } else if (str.toUpperCase().includes("K")) {
    return numberPart * 1000;
  } else {
    return numberPart;
  }
}
