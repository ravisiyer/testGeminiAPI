// components/Model.jsx
const { GoogleGenerativeAI } = require("@google/generative-ai");
const key = process.env.REACT_APP_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(key);
const modelName = process.env.REACT_APP_GEMINI_MODEL_NAME;
// console.log(`Model name: ${modelName}`)
const model = genAI.getGenerativeModel({ model: modelName });

export const generateContent = async (prompt) => {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text; // return the response
}