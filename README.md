# Minimal example showing error with Epic FHIR Dynamic Registration

[See a live demo of this repo](https://dreamy-frangollo-bf9d4c.netlify.app/)

Update: Thanks [Ashavan on StackOverflow](https://stackoverflow.com/questions/74894353/how-to-resolve-epics-fhir-oauth2-dynamic-registration-invalid-client-metadata/74895541#74895541) for helping me solve this issue!

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
