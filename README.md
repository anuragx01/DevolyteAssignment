# To-do List

A calm, responsive to-do list app built with React, Tailwind CSS, Redux Toolkit, RTK Query, and an Express API.

## Run locally

```bash
npm install
npm run dev
```

The Vite client runs at http://localhost:5173 and proxies `/api` requests to the Express server at http://localhost:4000. Production client files are generated with `npm run build`. Start the API with `npm start`.

Tasks are stored in `server/data/todos.json`, which is created the first time the API runs.
