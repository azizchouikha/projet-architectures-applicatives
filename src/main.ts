import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
const storageDriver = process.env.STORAGE_DRIVER ?? "file";

const app = createApp(storageDriver);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Loyalty API running on http://localhost:${port} (storage=${storageDriver})`
  );
});
