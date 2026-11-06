export type GoogleSignInFailureKind = 'cancelled' | 'account-conflict' | 'unavailable' | 'network' | 'configuration' | 'unknown';
export declare function googleSignInFailure(error: unknown): {kind: GoogleSignInFailureKind; message: string};
