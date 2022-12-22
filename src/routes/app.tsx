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
        <p>
          This demo is an example of a bug with Epic's dynamic registration.
          Below is a video of the bug in action:
        </p>
        <video controls>
          <source src="./bug.mp4" type="video/mp4" />
        </video>
      </main>
    </div>
  );
}
