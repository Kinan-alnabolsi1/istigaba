// Public surface of the generated contract types. Generated file: ./openapi.d.ts
export type { paths, components, operations } from './openapi';
import type { components, operations, paths } from './openapi';

/** All schemas under components.schemas. */
export type Schemas = components['schemas'];
/** A single schema by name, e.g. `Schema<'ErrorResponse'>`. */
export type Schema<Name extends keyof Schemas> = Schemas[Name];
/** Union of every operationId in the contract. */
export type OperationId = keyof operations;
/** Union of every path template in the contract. */
export type ApiPath = keyof paths;
