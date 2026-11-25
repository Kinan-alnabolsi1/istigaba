// VIOLATION: ad-hoc Axios outside packages/api-client
import axios from 'axios';
export const client = axios.create();
