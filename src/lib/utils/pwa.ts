interface ServiceWorkerSupportInput {
  hasServiceWorker: boolean;
  hostname: string;
  nodeEnv: string;
  protocol: string;
}

export function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function shouldRegisterServiceWorker({
  hasServiceWorker,
  hostname,
  nodeEnv,
  protocol,
}: ServiceWorkerSupportInput) {
  if (!hasServiceWorker || nodeEnv === "test") {
    return false;
  }

  return protocol === "https:" || isLocalHost(hostname);
}

export function getServiceWorkerRegistrationOptions(): RegistrationOptions {
  return {
    scope: "/",
  };
}
