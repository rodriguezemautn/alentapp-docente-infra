import { createBrowserRouter } from "react-router";

import { MembersView } from "./views/Members";
import { SportsView } from "./views/Sports";
import { DisciplinesView } from "./views/Disciplines";
import { PaymentsView } from "./views/Payments";
import { MedicalCertificatesView } from "./views/MedicalCertificates";
import { HomeView } from "./views/Home";
import Layout from "./Layout";

export let router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        path: "/",
        Component: HomeView,
      },
      {
        path: "/members",
        Component: MembersView,
      },
      {
        path: "/sports",
        Component: SportsView,
      },
      {
        path: "/disciplinas",
        Component: DisciplinesView,
      },
      {
        path: "/pagos",
        Component: PaymentsView,
      },
      {
        path: "/certificados-medicos",
        Component: MedicalCertificatesView,
      },
    ],
  },
]);
