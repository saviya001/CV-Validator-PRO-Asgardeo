⚙️ Vision Front Insights - Backend Setup Guide

This guide will walk you through the steps to install and run the backend of the Vision Front Insights system.

1️⃣ Install Requirements

Open your terminal inside the backend folder and run the following command to install all necessary dependencies:

pip install -r requirements.txt


2️⃣ Configuration - API Keys (.env File)

You need to provide your Google API keys for the system to function. Locate the .env file in your root folder. If it does not exist, create a new file named .env.

Update the following lines with your keys:

GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_google_search_api_key_here
GOOGLE_CSE_ID=your_search_engine_id_here


⚠️ IMPORTANT: If you do not know how to obtain these API keys, please refer to the "Get the API key.pdf" guide provided in the package for step-by-step instructions.

3️⃣ Run the Backend

Once everything is configured, start the backend server by running the following command in your terminal:

python main.py


🛡️ Important Notes

Python Version: Ensure you are using Python 3.10 or higher.

Billing & Quotas: To avoid "Rate Limit" errors (Error 429) when processing multiple CVs, ensure your Google Cloud account has billing enabled. Refer to the provided PDF for setup instructions.

Environment Security: Never share your .env file or upload it to public repositories to keep your API keys secure.

Vision Front Insights - Empowering Modern HR with AI Intelligence.