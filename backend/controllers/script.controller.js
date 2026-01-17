import openai from "../services/openai.service.js";
import { parseScript } from "../services/scriptParser.js";

export const scriptController = async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
You generate podcast scripts for a machine.

LINE FORMAT:
MUSIC:intro
SFX:transition
SPEECH:host:text
SPEECH:cohost:text
          `,
        },
        { role: "user", content: req.body.text },
      ],
    });

    const raw = response.choices[0].message.content;
    res.json({ script: parseScript(raw) });
    console.log("REQ.BODY.TEXT:", req.body.text);
    console.log("TYPE:", typeof req.body.text);


  } catch (err) {
    console.error("SCRIPT ERROR:", err);
    res.status(500).json({ error: "Script generation failed" });
  }
};
