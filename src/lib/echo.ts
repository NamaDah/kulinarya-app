"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

if (typeof window !== "undefined") {
  // @ts-ignore
  window.Pusher = Pusher;
}

export const echo =
  typeof window !== "undefined"
    ? new Echo({
        broadcaster: "reverb",
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "reverbkey",
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080),
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080),
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || "http") === "https",
        enabledTransports: ["ws", "wss"],
      })
    : null;
