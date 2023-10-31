import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AppRoutes } from "../app-routes";
import {
  fetchAccessTokenUsingJWT,
  fetchAccessTokenWithCode,
  getOAuth2State,
  registerDynamicClient,
} from "../services/epic";
import {
  storeDynamicRegistrationMetadata,
  storeConnection,
} from "../services/epic-connection-store";

enum Status {
  Pending = 0,
  Error = 1,
  Success = 2,
}

export default function EpicRedirect() {
  const [msg, setMsg] = useState("Hold on as we complete your login...");
  const [isError, setIsError] = useState(false);
  const [status1, setStatus1] = useState<Status>(Status.Pending);
  const [status2, setStatus2] = useState<Status>(Status.Pending);
  const [status3, setStatus3] = useState<Status>(Status.Pending);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the redirect callback from Epic, extract the code and state from the query params
    const searchRequest = new URLSearchParams(window.location.search),
      code = searchRequest.get("code"),
      state = searchRequest.get("state");

    if (code) {
      // Check that the state matches the one we sent
      if (!state || state !== getOAuth2State()) {
        setStatus1(Status.Error);
        setIsError(true);
        setMsg(
          "There was a problem trying to sign in: the state parameter was not provided or did not match the expected value"
        );
      } else {
        // With the code, fetch the initial access token. This access token is short-lived and will be used to register this web app as a dynamic client.
        fetchAccessTokenWithCode(code)
          .then(async (res) => {
            setStatus1(Status.Success);
            return registerDynamicClient(res);
          })
          .then(async (res) => {
            console.debug(res);
            await storeDynamicRegistrationMetadata(res);
            setStatus2(Status.Success);
            return fetchAccessTokenUsingJWT(res);
          })
          .then(async (res) => {
            console.debug(res);
            const nowInSeconds = Math.floor(Date.now() / 1000);
            await storeConnection({
              ...res,
              expires_at: nowInSeconds + res.expires_in,
            });
            setMsg("Successfully logged in! Redirecting...");
            setStatus3(Status.Success);
            setTimeout(() => {
              navigate(AppRoutes.Home);
            }, 100);
          })
          .catch((e) => {
            setIsError(true);
            setMsg(`${e.message}`);
          });
      }
    } else {
      setStatus1(Status.Error);
      setIsError(true);
      setMsg(
        "There was a problem trying to sign in: no `code` query parameter was provided in url"
      );
    }
  }, []);

  return (
    <div>
      <header>
        <h1>Epic FHIR Dynamic Registration Redirect</h1>
      </header>
      <main>
        <ol>
          <li>
            {status1 === Status.Pending
              ? "⬜ Waiting to fetch initial access token"
              : status1 === Status.Error
              ? "❌ Failed to fetch initial access token"
              : "✅ Successfully fetched initial access token"}
          </li>
          <li>
            {status2 === Status.Pending
              ? "⬜ Waiting to register dynamic client"
              : status2 === Status.Error
              ? "❌ Failed to register dynamic client"
              : "✅ Successfully registered dynamic client"}
          </li>
          <li>
            {status3 === Status.Pending
              ? "⬜ Waiting to fetch access token with JWT"
              : status3 === Status.Error
              ? "❌ Failed to fetch access token with JWT"
              : "✅ Successfully fetched access token with JWT"}
          </li>
        </ol>
        <p style={{ color: isError ? "red" : "" }}>{msg}</p>
        <a href={AppRoutes.Home}>
          <button type="button">Back to main page</button>
        </a>
      </main>
    </div>
  );
}
