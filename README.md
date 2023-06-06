# Epic FHIR Standalone Authentication with Dynamic Registration Example in React App

This repo is a quick demonstration of a React Single Page Application implementing Epic's Standalone Authentication with Dynamic Registration. This web app uses the WebCrypto API and IndexedDB to generate and store the asymmetric key pairs needed to implement this flow.

[See a live demo of this repo](https://dreamy-frangollo-bf9d4c.netlify.app/)

Note: Thanks [Ashavan on StackOverflow](https://stackoverflow.com/questions/74894353/how-to-resolve-epics-fhir-oauth2-dynamic-registration-invalid-client-metadata/74895541#74895541) for helping me solve an issue with registration and getting this demo working.

## Background

_TLDR:_ Using this flow, our app can securely get new access tokens without prompting a user to log in every time and without needing to communicate with a third party backend to handle the refresh.

Epic offers a few ways to authenticate with their FHIR API's. The tricky problem for mobile apps and browser based applications is that they are inherently "untrustable" and cannot securely store a secret directly like server or backend based applications can. This makes them incompatible with many OAuth2 authentication flows and makes it difficult for these clients to refresh their tokens securely without user input or without having a backend server refresh the client's tokens for them. For these "untrusted client" use cases, Epic implements the [OAuth 2.0 Dynamic Client Registration Protocol](https://fhir.epic.com/Documentation?docId=oauth2&section=Standalone-Oauth2-OfflineAccess-0).

The OAuth 2.0 Dynamic Client Registration Protocol works by (after a user initially authenticates themselves) allowing an untrusted client to generate a public/private asymmetric key pair, uploading the public key to the OAuth server, and securely use the private key to sign a token that the client can use to authenticate themselves to the server. The server can verify these tokens with the public key and does not need to share a private secret with the untrusted client. In web browsers and SPA's, we can use the WebCrypto API that lets us generate asymmetric key pairs using the SubtleCrypto interface and use them to sign tokens without actually exposing the value of the private key. Even better, we can store the SubtleCrypto object in IndexedDB storage, so we can indefinitely sign new tokens to authorize the client against the server, which will enable the client to refresh their authorization tokens as needed without requiring user intervention.

This means that our untrusted client can securely use this flow to continuously get new access tokens without any interaction with any backend server or without the need to store a client secret provided by the OAuth server.

## Getting Started

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

## Setting up an Epic App Registration

This example uses the same registration used by [Mere Medical](www.meremedical.co). If you decide to use this for your own app, you'll need to set up your own app registration with Epic. I've written a quick tutorial on how to do this [here](https://meremedical.co/docs/getting-started/epic-setup).
