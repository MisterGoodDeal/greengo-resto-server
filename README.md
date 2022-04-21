# ExpressJS + TypeScript boilerplate

This boilerplate includes a basic `ExpressJS` and `TypeScript` implementation.

## Getting started

Click on the button `Use this template` and give a name to your repository and then clone your project using CLI or GUI Client.

First things first, install all dependencies using `npm`.
```bash
npm install # Or `npm i`
```

Then you have to change the `package.json` according to your project:
```json
{
  "name": "expressjs-typescript-boilerplate", <=== Set this field to your project name
  "version": "1.0.0",
  "description": "ExpressJS & TypeScript boilerplate", <=== Set the description of your project
  ...
  "keywords": [ <=== Update the keywords according to your needs
    "server",
    "express",
    "mysql"
  ],
  "author": "MisterGoodDeal", <=== Set this to your username
  ...
}
```

## Available commands

Start the project locally using nodemon (*nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected*).
```bash
npm run start:dev
```

Build the project for production (It'll create a folder called `/build` in the root directory).
```bash
npm run build
```

Build and start the project
```bash
npm start
```

## Authentification middleware

This project includes a basic middleware in order to handle authentication using JWT.

In order to start using it you have to foloow those steps:

1. Generate a random secret key that you'll store in the `.env` file and set it's time validity.
```env
18| # JWT
19| JWT_SECRET= <your_secret_key>
20| JWT_EXPIRATION=7d # 7 days
```

2. Then according to your needs, you have to set the content of your Json Web Token. Change the interface of `JWTProps` in `src/utils/interface.ts`.
```ts
export interface JWTProps {
  id: number;
  uuid: string;
}
```

3. If you want to use the middleware on a specific route, you have to add the middleware to the route.
```ts
import { auth } from "../middleware/auth";

...

const authentificatedRoute = (app: any) => {
  app.post("/authentificatedRoute", auth, async function (req: any, res: Res) {
    // TODO
  });
};
```
