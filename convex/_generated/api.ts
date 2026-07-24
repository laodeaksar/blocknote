/* eslint-disable */
/**
 * Local Convex API reference.
 *
 * The imported repository does not include the deployment-generated files.
 * `anyApi` keeps client references usable until `convex codegen` is run against
 * the project's deployment.
 */
import { anyApi } from "convex/server";

// The deployment-generated API is unavailable until the project is linked to
// Convex. Keep the runtime references permissive so the app can still build
// and the client can be used once the deployment is configured.
export const api: any = anyApi;
export const internal: any = anyApi;
export const components: any = anyApi;