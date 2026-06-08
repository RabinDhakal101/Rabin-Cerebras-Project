export function parseFilename(filename) {
  const baseName = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .trim();

  const match = baseName.match(/model\s+([a-z0-9]+)\s+profile\s+(\d+)/i);

  if (!match) {
    return {
      model: "Unknown Model",
      profile: "Unknown Profile",
      modelKey: "unknown",
      profileNumber: null,
    };
  }

  const modelLetter = match[1].toUpperCase();
  const profileNumber = Number(match[2]);

  return {
    model: `Model ${modelLetter}`,
    profile: `Profile ${profileNumber}`,
    modelKey: modelLetter,
    profileNumber,
  };
}