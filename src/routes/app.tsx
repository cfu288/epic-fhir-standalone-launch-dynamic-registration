import { getLoginUrl } from "../services/epic";

export default function App() {
  return (
    <div>
      <header>
        <h1>Epic FHIR Dynamic Registration Demo</h1>
      </header>
      <main>
        <a href={getLoginUrl()}>
          <button type="button">Login to MyChart</button>
        </a>
      </main>
    </div>
  );
}
