# Minimal example showing error with Epic FHIR Dynamic Registration

This is a "minimal" repo showing that an SPA calling the `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/register` does not seem to work. Please let me know if I'm missing something - I'd love to try and figure out what's wrong.

I've attached a video of the bug in action below:
![Bug](./bug.mp4)

To run locally, you need npm installed. Run the following commands

```
npm i
npm run dev
```

If running locally, you may need to comment out the line `base: "/epic-fhir-standalone-launch-dynamic-registration/",` in `vite.config.js`.

You'll need a `.env` with the following:

```
VITE_EPIC_CLIENT_ID: <sandbox_client_id>
VITE_PUBLIC_URL: "http://localhost:5173"
```
