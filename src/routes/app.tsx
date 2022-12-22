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
          <source
            src="https://user-images.githubusercontent.com/2985976/209190730-d38774e3-2f56-4756-9c75-2f044654bd40.mp4"
            type="video/mp4"
          />
        </video>
      </main>
    </div>
  );
}
