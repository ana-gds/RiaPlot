# RiaPlot

Aplicação de planeamento de navegação para a **Ria de Aveiro**. Reúne num mapa
interativo os cais, as rotas (importadas de ficheiros GPX), a previsão de marés
por local (modelo Valida4D da Hidromod) e a **simulação de profundidade** ao
longo de uma rota (tendo em conta o calado
e as folgas da embarcação). Inclui ainda uma vertente **social** — publicações,
gostos, comentários, seguir utilizadores e notificações.

## Stack

| Camada    | Tecnologia |
|-----------|------------|
| Frontend  | React 19 · Vite · Tailwind CSS 4 · React Router · Leaflet |
| Backend   | Laravel 13 · Laravel Sanctum (auth) |
| Base de dados | MongoDB (via `mongodb/laravel-mongodb`) |
| Serviços externos | Hidromod Valida4D (simulação + marés por local) |

O repositório é um monorepo: a aplicação React vive na raiz e a API Laravel em
[`riaplot-api/`](riaplot-api/).

## Pré-requisitos

- **Node.js** 20+ e npm
- **PHP** 8.3+ e **Composer**
- **MongoDB** — uma base local ou um cluster MongoDB Atlas
- Extensão PHP `mongodb` instalada (no Windows/Laragon vem incluída)

## Configuração

### 1. Backend (`riaplot-api`)

```bash
cd riaplot-api
composer install
cp .env.example .env
php artisan key:generate
```

Edita o `.env` e configura a ligação ao MongoDB:

```env
DB_CONNECTION=mongodb
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/?appName=Cluster0"
MONGODB_DATABASE=riaplot_db
```

Popula a base com dados iniciais (utilizador de teste, cais e rotas):

```bash
php artisan db:seed
```

Arranca a API:

```bash
php artisan serve   # http://127.0.0.1:8000
```

> **Windows/Laragon:** se o `php` não estiver no PATH, usa o executável do
> Laragon (ex.: `C:\laragon\bin\php\php-8.3.x\php.exe`) ou arranca a API pelo
> painel do Laragon.

### 2. Frontend (raiz do projeto)

```bash
npm install
cp .env.example .env   # define VITE_API_URL (default: http://127.0.0.1:8000/api)
npm run dev            # http://localhost:5173
```

A URL da API é lida de `VITE_API_URL` ([src/config.js](src/config.js)); sem a
variável definida, recai no servidor local.

## Variáveis de ambiente

**Frontend** ([.env.example](.env.example))

| Variável        | Descrição |
|-----------------|-----------|
| `VITE_API_URL`  | URL base da API Laravel (sem barra final) |

**Backend** (`riaplot-api/.env`)

| Variável           | Descrição |
|--------------------|-----------|
| `MONGODB_URI`      | String de ligação ao MongoDB |
| `MONGODB_DATABASE` | Nome da base de dados (ex.: `riaplot_db`) |
| `DB_CONNECTION`    | Deve ser `mongodb` |

## Importação de dados

A API inclui comandos Artisan para popular as rotas, marés e dados de simulação
(executar a partir de `riaplot-api/`):

| Comando | Função |
|---------|--------|
| `php artisan gpx:import`        | Parseia os GPX em `storage/app/public/gpx/` e preenche os trackpoints das rotas |
| `php artisan gpx:match`         | Cruza ficheiros GPX com rotas da BD por proximidade e nome |
| `php artisan sim:import`        | Importa rotas e dados de simulação dos JSON em `storage/app/sim/` |
| `php artisan sim:backfill-depth`| Preenche `min_depth` em rotas com `sim_file` mas sem profundidade |
| `php artisan sim:fix-unmatched` | Liga rotas sem trackpoints aos JSON de simulação pelo nome dos cais |
| `php artisan tides:refresh-points` | Pré-calcula a maré (Valida4D) dos pontos de referência da Ria para a coleção `tide_points` (agendado diariamente) |
| `php artisan routes:fetch-images` | Procura e guarda uma foto (Wikipédia) para cada rota |

## Testes

A suite de testes do backend corre numa base MongoDB **isolada** (`riaplot_test`)
configurada em [phpunit.xml](riaplot-api/phpunit.xml); as coleções são limpas
antes de cada teste e há uma salvaguarda que recusa correr fora de uma base de
testes.

```bash
cd riaplot-api
php artisan test
```

## Scripts do frontend

| Script            | Função |
|-------------------|--------|
| `npm run dev`     | Servidor de desenvolvimento (Vite + HMR) |
| `npm run build`   | Build de produção para `dist/` |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm run lint`    | Corre o ESLint |

## Estrutura do projeto

```
RiaPlot/
├── src/                  # Aplicação React
│   ├── pages/            # Ecrãs (mapa, social, perfil, rotas, auth…)
│   ├── components/       # Componentes (mapa, partilhados, UI)
│   ├── services/         # Cliente da API e simulação
│   ├── contexts/         # AuthContext (sessão/token)
│   └── config.js         # URL base da API
└── riaplot-api/          # API Laravel
    ├── app/Http/Controllers/
    ├── app/Models/       # Modelos MongoDB
    ├── app/Console/Commands/  # Comandos de importação
    └── routes/api.php    # Endpoints
```
