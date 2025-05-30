import { serveDir } from "jsr:@std/http";

Deno.serve(async (req) => {
  const fsRoot = "dist/ricardo-portafolios/browser";
  const headers = ["Cache-Control: max-age=31536000"];
  const response = await serveDir(req, { fsRoot, headers });
  if (response.status === 404) {
    const url = new URL(req.url);
      return Response.redirect(url.origin)
  }
  return response;
  
});