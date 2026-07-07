"use client";

import { useEffect, useState } from "react";
import {
  getServiceWorkerRegistrationOptions,
  shouldRegisterServiceWorker,
} from "@/lib/utils/pwa";

export function PwaRegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (
      !shouldRegisterServiceWorker({
        hasServiceWorker: "serviceWorker" in navigator,
        hostname: window.location.hostname,
        nodeEnv: process.env.NODE_ENV,
        protocol: window.location.protocol,
      })
    ) {
      return;
    }

    let isMounted = true;

    function watchRegistration(registration: ServiceWorkerRegistration) {
      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;

        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener("statechange", () => {
          if (
            installingWorker.state === "installed" &&
            navigator.serviceWorker.controller &&
            isMounted
          ) {
            setWaitingWorker(installingWorker);
          }
        });
      });
    }

    navigator.serviceWorker
      .register("/sw.js", getServiceWorkerRegistrationOptions())
      .then(watchRegistration)
      .catch(() => {
        // Offline support is an enhancement; failed registration should not block the app.
      });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (isRefreshing) {
        return;
      }

      setIsRefreshing(true);
      window.location.reload();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function applyUpdate() {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  }

  if (!waitingWorker) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm shadow-soft">
      <span className="font-semibold text-[var(--text)]">A new TrackPaisa version is ready.</span>
      <button
        type="button"
        onClick={applyUpdate}
        className="min-h-10 rounded-lg bg-[var(--primary)] px-3 font-bold text-white"
      >
        Reload
      </button>
    </div>
  );
}
