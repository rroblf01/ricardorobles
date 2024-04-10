import { serveDir } from "https://deno.land/std@0.217.0/http/file_server.ts";

Deno.serve((req) => {
  const pathname = new URL(req.url).pathname;
    return serveDir(req, {
        fsRoot: "dist/ricardo-portafolios/browser",
      headers: ["Cache-Control: max-age=336000"],
    });
});