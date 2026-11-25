// Type helpers that derive request/response shapes from the generated contract (@istigaba/api-types).
import type { ApiPath, paths } from '@istigaba/api-types';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Methods that the contract defines for a path. */
export type MethodsOf<P extends ApiPath> = {
  [M in HttpMethod]-?: [NonNullable<paths[P][M]>] extends [never] ? never : M;
}[HttpMethod];

export type Operation<P extends ApiPath, M extends MethodsOf<P>> = NonNullable<paths[P][M]>;

type JsonContent<T> = T extends { content: { 'application/json': infer B } } ? B : never;

export type PathParams<O> = O extends { parameters: { path?: infer PP } }
  ? [NonNullable<PP>] extends [never]
    ? undefined
    : NonNullable<PP>
  : undefined;

export type QueryParams<O> = O extends { parameters: { query?: infer Q } }
  ? [NonNullable<Q>] extends [never]
    ? undefined
    : NonNullable<Q>
  : undefined;

export type RequestBody<O> = O extends { requestBody?: infer RB }
  ? [NonNullable<RB>] extends [never]
    ? undefined
    : JsonContent<NonNullable<RB>>
  : undefined;

/** Union of JSON bodies of the 2xx responses. */
export type SuccessBody<O> = O extends { responses: infer R }
  ? {
      [K in keyof R]: K extends 200 | 201 | 202 ? JsonContent<R[K]> : never;
    }[keyof R]
  : never;
