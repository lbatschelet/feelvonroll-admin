# feelvonroll-admin

Admin panel for the [feelvonRoll](https://github.com/lbatschelet/feelvonroll) project. Provides a web interface to manage pins, configure the questionnaire and its translations, and administer users and languages.

> [!NOTE]
> Part of the [feelvonRoll](https://github.com/lbatschelet/feelvonroll) project, developed for [PHBern](https://www.phbern.ch) within [RealTransform](https://sustainability.uzh.ch/de/forschung-lehre/forschung/realtransform.html). See the [main repository](https://github.com/lbatschelet/feelvonroll) for full documentation and project context.

## Features

- **Dashboard** with pin statistics
- **Pin management**: search, filter, sort, paginate, approve/reject, bulk actions, CSV export
- **Questionnaire editor**: configure questions (slider, multi-choice, text), drag-and-drop reordering, multi-language translations in a unified table
- **Language management**: add, activate/deactivate, delete languages
- **User management**: create users, assign admin roles, password reset links
- **Audit log**: track admin actions
- **Navigation guard**: warns about unsaved changes before leaving the questionnaire page

## Install & Run

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Configuration

The admin panel connects to the [feelvonroll-api](../feelvonroll-api/). By default it expects the API at `/api`.

To point to a different API during development, create a `.env.local` file:

```
VITE_API_BASE=http://localhost:8080
```

## Build

```bash
npm run build
```

The production build is output to `dist/`. Set `VITE_API_BASE` at build time if needed:

```bash
VITE_API_BASE=https://api.example.com npm run build
```

## Tests

```bash
npm test
```

## Authentication

The admin panel uses JWT-based authentication. On first setup, a bootstrap flow creates the initial admin user using the `admin_token` configured in the API.

## License

[AGPL-3.0](LICENSE) -- [Lukas Batschelet](https://lukasbatschelet.ch) for [PHBern](https://www.phbern.ch)
