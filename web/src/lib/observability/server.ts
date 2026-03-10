type TelemetryValue = string | number | boolean | null;

export type TelemetryPayload = Record<string, TelemetryValue>;

function payloadToJson(payload: TelemetryPayload) {
  return JSON.stringify(payload);
}

export function logServerEvent(name: string, payload: TelemetryPayload) {
  console.info(`[obs:event] ${name} ${payloadToJson(payload)}`);
}

export function logServerError(
  scope: string,
  error: unknown,
  payload: TelemetryPayload = {},
) {
  const normalizedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n') ?? null,
        }
      : {
          name: 'UnknownError',
          message: String(error),
          stack: null,
        };

  console.error(
    `[obs:error] ${scope} ${payloadToJson({
      ...payload,
      errorName: normalizedError.name,
      errorMessage: normalizedError.message,
      errorStack: normalizedError.stack,
    })}`,
  );
}
