// Where an unauthenticated visitor is sent. Kept as a function because several
// call sites treat it as one.
export const getLoginUrl = () => "/auth";
