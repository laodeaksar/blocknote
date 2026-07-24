/* eslint-disable */
import type {
  GenericActionCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import type { DataModel } from "./dataModel";

export declare const query: typeof import("convex/server").queryGeneric;
export declare const internalQuery: typeof import("convex/server").internalQueryGeneric;
export declare const mutation: typeof import("convex/server").mutationGeneric;
export declare const internalMutation: typeof import("convex/server").internalMutationGeneric;
export declare const action: typeof import("convex/server").actionGeneric;
export declare const internalAction: typeof import("convex/server").internalActionGeneric;
export declare const httpAction: typeof import("convex/server").httpActionGeneric;

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
export type DatabaseReader = GenericDatabaseReader<DataModel>;
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;