Gemini AI API 2nd Trial - Simple app to test text interaction with Google Gemini API with user choice of model
========================================

This Gemini AI API 2nd Trial app is based on an earlier project/app: [Simple React app using Google Gemini API](https://github.com/ravisiyer/GeminiAPITrial) but simplifies it for trials/tests by showing only one exchange (current or previous) between user and Gemini AI. It provides an additional feature of listing the Gemini AI models available via API and allowing user to choose the model used for the Gemini API calls. The user can also type in the name of this model.

I tested this Gemini AI API 2nd Trial app and it is working on localhost.

To get this repo's app running, after cloning the repo and npm install:\
Add your Google Gemini API key to .env file as:\
REACT_APP_GEMINI_API_KEY=YOUR-API-KEY

You may change the .env variable REACT_APP_GEMINI_MODEL_NAME (acts as default model used by app) to a current model that works with your API key.\
Note that I do not have the time to test the above procedure to get the app running and so I may have missed some step.

Blog post associated with this app and the earlier verison app: [Google Gemini (AI) API has free tier; Easily setup and ran tutorial article React app using API; Wrote 2nd Trial app with user choice for model](https://raviswdev.blogspot.com/2025/04/google-gemini-ai-api-has-free-tier.html).

Acknowledgement
---------------
The above mentioned [Simple React app using Google Gemini API](https://github.com/ravisiyer/GeminiAPITrial) itself is based on the code from the article: [How to Integrate Gemini API with React.js: A Step-by-Step Guide.](https://dev.to/tahrim_bilal/how-to-integrate-gemini-api-with-reactjs-a-step-by-step-guide-341b) Many thanks to the author and publisher of the article.
