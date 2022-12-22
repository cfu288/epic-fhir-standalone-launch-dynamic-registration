import { AppRoutes } from "../app-routes";
import { getPublicKey, IDBConfig } from "../utils/web-crypto";
import { v4 as uuidv4 } from "uuid";
import { signJwt } from "../utils/jwt-tools";

export const baseUrl = "https://fhir.epic.com/interconnect-fhir-oauth";

export function getDSTU2Url() {
  return `${baseUrl}/api/FHIR/DSTU2`;
}

export function getLoginUrl(): string & Location {
  const params = {
    client_id: `${import.meta.env.VITE_EPIC_CLIENT_ID}`,
    scope: "Patient.read Patient.search",
    redirect_uri: `${import.meta.env.VITE_PUBLIC_URL}${AppRoutes.EpicCallback}`,
    aud: getDSTU2Url(),
    response_type: "code",
  };

  return `${baseUrl}/oauth2/authorize?${new URLSearchParams(
    params
  )}` as string & Location;
}

/**
 * Step 1: Get an access token with the code
 * @param code Code from Epic
 * @returns
 */
export async function fetchAccessTokenWithCode(
  code: string
): Promise<EpicAuthResponse> {
  const res = await fetch(`${baseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: `${import.meta.env.VITE_EPIC_CLIENT_ID}`,
      redirect_uri: `${import.meta.env.VITE_PUBLIC_URL}${
        AppRoutes.EpicCallback
      }`,
      code: code,
    }),
  });
  if (res.status !== 200) {
    const text = await res.text();
    throw new Error(
      `Error getting access token: API returned a ${res.status} with data ${text}`
    );
  }
  return res.json();
}

export async function registerDynamicClient(
  res: EpicAuthResponse
): Promise<EpicDynamicRegistrationResponse> {
  const jsonWebKeySet = await getPublicKey();
  const validJWKS = jsonWebKeySet as JsonWebKeyWKid;
  const request: EpicDynamicRegistrationRequest = {
    software_id: `${import.meta.env.VITE_EPIC_CLIENT_ID}`,
    jwks: {
      keys: [
        {
          e: validJWKS.e,
          kty: validJWKS.kty,
          n: validJWKS.n,
          kid: `${IDBConfig.KEY_ID}`,
        },
      ],
    },
  };
  // We've got a temp access token and public key, now we can register this app as a dynamic client
  const registerRes = await fetch(`${baseUrl}/oauth2/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${res.access_token}`,
    },
    body: JSON.stringify(request),
  });
  if (registerRes.status !== 200) {
    const text = await registerRes.text();
    throw new Error(
      `Error registering dynamic client: API returned a ${registerRes.status} with data ${text}`
    );
  }
  return await registerRes.json();
}

export async function fetchAccessTokenUsingJWT(
  res: EpicDynamicRegistrationResponse
): Promise<EpicAuthResponse> {
  // We've registered, now we can get another access token with our signed JWT
  const jwtBody = {
    sub: res.client_id,
    iss: res.client_id,
    aud: `${baseUrl}/oauth2/token`,
    jti: uuidv4(),
  };
  const signedJwt = await signJwt(jwtBody);
  const tokenRes = await fetch(`${baseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      client_id: res.client_id,
      assertion: signedJwt,
    }),
  });
  if (tokenRes.status !== 200) {
    const text = await tokenRes.text();
    throw new Error(`Error getting access token with JWT: ${text}`);
  }
  return await tokenRes.json();
}

export interface EpicAuthResponse {
  access_token: string;
  expires_in: number;
  patient: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface EpicDynamicRegistrationResponse {
  redirect_uris: string[];
  token_endpoint_auth_method: string;
  grant_types: string[];
  software_id: string;
  client_id: string;
  client_id_issued_at: number;
  jwks: JsonWebKeySet;
}

export interface EpicDynamicRegistrationRequest {
  software_id: string;
  jwks: JsonWebKeySet;
}
export interface JsonWebKeyWKid extends JsonWebKey {
  kid: string;
  kty: string;
  e: string;
  n: string;
}

export interface JsonWebKeySet {
  keys: JsonWebKeyWKid[];
}

interface TokenPayload {
  [key: string]: string | number | boolean | object;
}

export interface EpicDynamicRegistrationResponse {
  redirect_uris: string[];
  token_endpoint_auth_method: string;
  grant_types: string[];
  software_id: string;
  client_id: string;
  client_id_issued_at: number;
  jwks: JsonWebKeySet;
}
