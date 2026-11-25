// Type-level smoke test: compiles only if the generated contract still has these shapes.
import type { ApiPath, OperationId, Schema, operations } from '../src';

const sosPath: ApiPath = '/me/reports/sos';
const loginOp: OperationId = 'login';

type SosResponses = operations['createSosReport']['responses'];
type ErrorBody = Schema<'Error'>;

const errorBody: ErrorBody = { code: 'not_found', message: 'x', request_id: 'r' };
const anonymous: Schema<'ReporterAnonymous'> | undefined = undefined;

export type { SosResponses };
export { anonymous, errorBody, loginOp, sosPath };
