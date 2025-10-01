import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { ApiResponse } from "shared/dist";

const app = new Hono();
app.use(logger());
app.use(cors());

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.get("/hello", async (c) => {
    const data: ApiResponse = {
        message: "Hello BHVR!",
        success: true,
    };

    return c.json(data, { status: 200 });
});

app.get("/salut", async (c) => {
    const data: ApiResponse = {
        message: "salut BHVR!",
        success: true,
    };

    return c.json(data, { status: 200 });
});

export default app;
