import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

export const runtime = "edge";

export async function POST(req: Request) {

    let { prompt } = await req.json();
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content:
                    "You are an AI assistant that help in analysing product data coming from various websites" +
                    "The promp provides a number of user reviews about the product as a JavaScript object" +
                    "Take each reivew combine and summarize all points together" +
                    "You should then separate them into possitives and negatives, keep each point no longer than 10 words" +
                    "# Create a JavaScript object for positives and negatives " +
                    "Respond with just an object, no additioanl text!",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.6,
        top_p: 1,
    });

    return new Response(response.choices[0].message.content)
}