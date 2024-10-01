# Open Pioneer Trails Starter

[![Build and deploy](https://github.com/open-pioneer/trails-starter/actions/workflows/test-and-build.yml/badge.svg)](https://github.com/open-pioneer/trails-starter/actions/workflows/test-and-build.yml) [![Audit dependencies (daily)](https://github.com/open-pioneer/trails-starter/actions/workflows/audit-dependencies.yml/badge.svg)](https://github.com/open-pioneer/trails-starter/actions/workflows/audit-dependencies.yml)

[Samples](https://open-pioneer.github.io/trails-demo/starter/) | [API Documentation](https://open-pioneer.github.io/trails-demo/starter/docs/) | [User manual](https://github.com/open-pioneer/trails-starter/tree/main/docs)

## Quick start

Ensure that you have [Node](https://nodejs.org/en/) (Version 18 or later) and [pnpm](https://pnpm.io/) (Version 9.x) installed.

Then execute the following commands to get started:

```bash
$ git clone https://github.com/open-pioneer/trails-starter.git # Clone the repository
$ cd trails-starter
$ pnpm install                                                 # Install dependencies
$ pnpm run dev                                                 # Launch development server
```

Vite will print the project's local address (usually <http://localhost:5173/>).
Point your browser at it and start programming!

Additional in-depth information can be found in the [Documentation](./docs/README.md).

## Docker

**Build** the image with:

```shell
docker build -t 52north/i-cisk-guadalquivir:latest .
```

**Run** the image with:

```shell
docker run -p 80:8080 --rm --name ll-spain 52north/i-cisk-guadalquivir:latest
```

**Access** the application in your browser <http://localhost/>.

## License

Apache-2.0 (see `LICENSE` file)
