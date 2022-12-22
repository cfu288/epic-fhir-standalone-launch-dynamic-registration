import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/app";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppRoutes } from "./app-routes";
import EpicRedirect from "./routes/epic-redirect";

const router = createBrowserRouter([
  {
    path: AppRoutes.Home,
    element: <App />,
  },
  {
    path: AppRoutes.EpicCallback,
    element: <EpicRedirect />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);
