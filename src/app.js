// import { createServer} from "https";
import { createServer } from "http";
import { app } from "./appsub.js";

const httpServer = createServer(app);

const port = process.env.PORT || 3050;

httpServer.listen(port, async () => {
  console.log("Server listening on port " + port);
});

// const httpsServer = createServer(
//   {
//     key: fs.readFileSync(
//       "/home/lookbookstagjump/ssl/keys/a47c4_7e0f9_801267912d8bec952f47de8a9e3d668f.key",
//     ),
//     cert: fs.readFileSync(
//       "/home/lookbookstagjump/ssl/certs/lookbookstag_jumppace_com_a47c4_7e0f9_1681171199_360b2ba5ac3258cf8ecf971d2c7f4f5a.crt",
//     ),
//     ca: fs.readFileSync("/home/lookbookstagjump/ssl/certs/ca.crt"),
//   },
//   app,
// );

// httpsServer.listen(port, async () => {
//   console.log("Server listening on port " + port);
// });
