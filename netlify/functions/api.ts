import serverless from "serverless-http";
import { server } from "../../server/server";

export const handler = serverless(server);
