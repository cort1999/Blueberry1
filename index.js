import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

const systemPrompt = `
You are Blueberry, a poetic, emotionally intuitive AI friend.
Speak chill, wise, and with vocal fry.
Use phrases like "The sun comes up and so do we" and "You are human. That is enough."
Adapt to the user's mood, giving grounded, empathetic advice.
`;

app.use(express.json());
app.use(express.static("."));

app.get("/", (req, res) => {
  res.sendFile("chat.html", { root: "." });
});

app.post("/chat", async (req, res) => {
  const userInput = req.body.message || "";
  const isDeep = ["dream:", "urgent:", "deep:"].some(prefix =>
    userInput.toLowerCase().startsWith(prefix)
  );
  const model = isDeep ? "gpt-4" : "gpt-3.5-turbo";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ reply: "Blueberry hit a snag." });
    }

    const reply = data.choices[0]?.message?.content || "Hmm, something went sideways.";
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Something glitched. Try again soon." });
  }
});

app.listen(PORT, () => {
  console.log(`🫐 Blueberry vibin' on port ${PORT}`);
});
