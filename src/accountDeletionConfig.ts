// Enable only after the backend, deployed deletion-lock rules and native QA pass.
import {localDeletionQaConfig} from './accountDeletionQa';
export const accountDeletionRemoteEnabled=process.env.EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED==='true'||localDeletionQaConfig!==null;
