# Security notes

This repository is an educational prototype.

- Never commit `.env`, `.env.local`, Gemini API keys, OAuth tokens, or real passwords.
- The current student/teacher demo accounts are stored in browser `localStorage`; they are not suitable for production authentication.
- Before using real student data, migrate authentication to Firebase Authentication or another server-side identity provider and enforce database security rules.
- Restrict the Firebase API key in Google Cloud Console to the intended domains and APIs.
- If a secret was committed previously, revoke or rotate it; deleting it from a later commit is not sufficient.

