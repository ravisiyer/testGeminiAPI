Simple React app using Google Gemini API
========================================

This project is based on the code from the article: [How to Integrate Gemini API with React.js: A Step-by-Step Guide.](https://dev.to/tahrim_bilal/how-to-integrate-gemini-api-with-reactjs-a-step-by-step-guide-341b). It has a [GitHub repo](https://github.com/Tahrim19/chatbot) and a [broken due to API key expiry, live site](https://chatbot-kappa-five.vercel.app/). The live site shows up the page but fails to get response from Gemini with the browser console showing "API key expired. Please renew the API key."

To get the app running, after cloning the repo:
Add your Google Gemini API key to .env file as:\
REACT_APP_GEMINI_API_KEY=YOUR-API-KEY

You may also have to change the model in src\components\Model.jsx to a current model that works with your API key.

I tested the app and it is working on localhost with a pretty decent user interface.