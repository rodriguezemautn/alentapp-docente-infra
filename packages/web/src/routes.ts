import { createBrowserRouter } from "react-router";

import { MembersView } from "./views/Members";
import { SportsView } from "./views/Sports";
import { PaymentsView } from "./views/Payments";
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
        path: "/pagos",
        Component: PaymentsView,
      },
    ],
  },
]);
