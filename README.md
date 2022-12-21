# Serial Luncher API server

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

Start the app via SSH:
```bash
cloudlinux-selector start --json --interpreter nodejs --user fuje2936 --app-root /home/fuje2936/serial-luncher-api.turtlecorp.fr
```

Stop the app via SSH:
```bash
cloudlinux-selector start --json --interpreter nodejs --user fuje2936 --app-root /home/fuje2936/serial-luncher-api.turtlecorp.fr
```
