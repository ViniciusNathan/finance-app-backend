import { onRequest } from "firebase-functions/https";
import { setGlobalOptions } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import app from "./src/app.js";

const databaseUrl = defineSecret("database-url");

setGlobalOptions({ maxInstances: 10 });

export const api = onRequest(
  {
    region: "southamerica-east1",
    vpcConnector: "finance-app-vpc-connector",
    vpcConnectorEgressSettings: "PRIVATE_RANGES_ONLY",
    secrets: [databaseUrl],
  },
  app
);