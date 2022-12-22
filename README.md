# Minimal example showing error with Epic FHIR Dynamic Registration

[See a live demo of this repo](https://dreamy-frangollo-bf9d4c.netlify.app/)

This is a "minimal" repo showing that an SPA calling the `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/register` does not seem to work. Please let me know if I'm missing something - I'd love to try and figure out what's wrong.

I've attached a video of the bug in action below:

https://user-images.githubusercontent.com/2985976/209190730-d38774e3-2f56-4756-9c75-2f044654bd40.mp4

To run locally, you need npm installed. Run the following commands

```
npm i
npm run dev
```

You'll need a `.env` with the following:

```
VITE_EPIC_CLIENT_ID: <sandbox_client_id>
VITE_PUBLIC_URL: "http://localhost:5173"
```
