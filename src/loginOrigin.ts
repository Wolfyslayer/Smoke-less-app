/** Ephemeral login source, shared across the guest-to-account session remount. */
export type LoginOrigin='profile'|'onboarding';
let pending:LoginOrigin|null=null;
export function setLoginOrigin(origin:LoginOrigin|null):void {pending=origin;}
export function consumeLoginOrigin():LoginOrigin|null {const origin=pending;pending=null;return origin;}
