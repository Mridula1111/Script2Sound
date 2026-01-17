export function parseScript(raw) {
  return raw
    .split("\n")
    .map((line) => {
      if (line.startsWith("MUSIC:")) {
        return { type: "music", id: line.slice(6).trim() };
      }

      if (line.startsWith("SFX:")) {
        return { type: "sfx", id: line.slice(4).trim() };
      }

      if (line.startsWith("SPEECH:")) {
        const match = line.match(/^SPEECH:(host|cohost):(.*)$/);
        if (!match) return null;

        return {
          type: "speech",
          speaker: match[1],
          text: match[2].trim(),
        };
      }

      return null;
    })
    .filter(Boolean);
}
