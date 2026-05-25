import { createBrowserRouter } from "react-router";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { MembersView } from "./views/Members";
import { SportsView } from "./views/Sports";
import { PaymentsView } from "./views/Payments";
import { MedicalCertificatesView } from "./views/MedicalCertificates";
import { DisciplinesView } from "./views/Disciplines";
import { HomeView } from "./views/Home";
import Layout from "./Layout";

function withErrorBoundary(Component: React.ComponentType) {
  return () => (
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  );
}

export let router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        path: "/",
        Component: withErrorBoundary(HomeView),
      },
      {
        path: "/members",
        Component: withErrorBoundary(MembersView),
      },
      {
        path: "/sports",
        Component: withErrorBoundary(SportsView),
      },
      {
        path: "/pagos",
        Component: withErrorBoundary(PaymentsView),
      },
      {
        path: "/certificados-medicos",
        Component: withErrorBoundary(MedicalCertificatesView),
      },
      {
        path: "/disciplinas",
        Component: withErrorBoundary(DisciplinesView),
      },
    ],
  },
]);
