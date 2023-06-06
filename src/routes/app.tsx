import { useEffect, useState } from "react";
import {
  EpicAuthResponse,
  EpicDynamicRegistrationResponse,
  fetchAccessTokenUsingJWT,
  getLoginUrl,
} from "../services/epic";
import {
  getLastConnection,
  getLastDynamicRegistration,
  storeConnection,
} from "../services/epic-connection-store";

export default function App() {
  const [dr, setDr] = useState<EpicDynamicRegistrationResponse | undefined>();
  const [con, setCon] = useState<
    (EpicAuthResponse & { expires_at: number }) | undefined
  >();
  const [expiresAt, setExpiresAt] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    getLastDynamicRegistration().then((dr) => {
      setDr(dr);
    });
    getLastConnection().then((con) => {
      setCon(con);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (con?.expires_at) {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        setExpiresAt(con?.expires_at - nowInSeconds);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [con?.expires_at]);

  return (
    <div>
      <header>
        <h1>Epic FHIR Dynamic Registration Demo</h1>
      </header>
      <main>
        <a href={getLoginUrl()}>
          <button type="button">Login to MyChart</button>
        </a>
        <section>
          <h2>Sandbox credentials:</h2>
          <p>
            username: <code>fhirderrick</code>
          </p>
          <p>
            passowrd: <code>epicepic1</code>
          </p>
        </section>
        {dr ? (
          <article>
            <h2>Dynamic Client Registration Data</h2>
            <p>{`Dynamic Client ID: ${dr.client_id}`}</p>
            <details>
              <summary>Raw Response Data</summary>
              <pre>{JSON.stringify(dr, null, 2)}</pre>
            </details>
          </article>
        ) : (
          <article>
            After you log in, your dynamic client data will show here
          </article>
        )}
        {con ? (
          <article>
            <h2>Connection Data</h2>
            <p>
              {expiresAt > 0
                ? `Token expires in: ${expiresAt} seconds`
                : "Token Expired"}
            </p>
            <button
              disabled={isRefreshing}
              onClick={async () => {
                try {
                  if (dr) {
                    setIsRefreshing(true);
                    const accessToken = await fetchAccessTokenUsingJWT(dr);
                    const nowInSeconds = Math.floor(Date.now() / 1000);
                    const newCon = {
                      ...accessToken,
                      expires_at: nowInSeconds + accessToken.expires_in,
                    };
                    await storeConnection(newCon);
                    setCon(newCon);
                    setIsRefreshing(false);
                  }
                } catch (e) {
                  setIsRefreshing(false);
                }
              }}
            >
              {isRefreshing ? "Refreshing" : "Refresh Token"}
            </button>
            <details>
              <summary>Raw Response Data</summary>
              <pre>{JSON.stringify(con, null, 2)}</pre>
            </details>
          </article>
        ) : (
          <article>
            After you log in, your connection data will show here
          </article>
        )}
      </main>
    </div>
  );
}
