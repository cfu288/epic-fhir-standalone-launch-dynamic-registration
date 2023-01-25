import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AppRoutes } from "../app-routes";
import {
  fetchAccessTokenUsingJWT,
  fetchAccessTokenWithCode,
  registerDynamicClient,
} from "../services/epic";
import {
  storeDynamicRegistrationMetadata,
  storeConnection,
} from "../services/epic-connection-store";

enum Status {
  Idle = 0,
  Pending = 1,
  Error = 2,
  Success = 3,
}

export default function EpicRedirect() {
  const [msg, setMsg] = useState("Hold on as we complete your login...");
  const [isError, setIsError] = useState(false);
  const [status1, setStatus1] = useState<Status>(Status.Idle);
  const [status2, setStatus2] = useState<Status>(Status.Idle);
  const [status3, setStatus3] = useState<Status>(Status.Idle);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the redirect callback from Epic
    const searchRequest = new URLSearchParams(window.location.search),
      code = searchRequest.get("code");

    if (code) {
      fetchAccessTokenWithCode(code)
        .then(async (res) => {
          setStatus1(Status.Success);
          return registerDynamicClient(res);
        })
        .then(async (res) => {
          setStatus2(Status.Success);
          console.log(res);
          await storeDynamicRegistrationMetadata(res);
          return fetchAccessTokenUsingJWT(res);
        })
        .then(async (res) => {
          setStatus3(Status.Success);
          console.log(res);
          const nowInSeconds = Math.floor(Date.now() / 1000);
          await storeConnection({
            ...res,
            expires_at: nowInSeconds + res.expires_in,
          });
          setMsg("Successfully logged in!");
          setTimeout(() => {
            navigate(AppRoutes.Home);
          }, 100);
        })
        .catch((e) => {
          setIsError(true);
          setMsg(`${e.message}`);
        });
    } else {
      setStatus1(Status.Error);
      setIsError(true);
      setMsg(
        "There was a problem trying to sign in: no code was provided in url"
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
            {status1 === Status.Idle || status1 === Status.Pending
              ? "⬜ Waiting to fetch initial access token"
              : status1 === Status.Error
              ? "❌ Failed to fetch initial access token"
              : "✅ Successfully fetched initial access token"}
          </li>
          <li>
            {status2 === Status.Idle || status2 === Status.Pending
              ? "⬜ Waiting to register dynamic client"
              : status2 === Status.Error
              ? "❌ Failed to register dynamic client"
              : "✅ Successfully registered dynamic client"}
          </li>
          <li>
            {status3 === Status.Idle || status3 === Status.Pending
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
