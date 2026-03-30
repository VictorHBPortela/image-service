# Planejamento Low-Level — Image Service

> Documento de planejamento técnico detalhado, derivado da análise high-level.
> Story points estimados para um desenvolvedor júnior (escala Fibonacci).
> **Referência de SP:** 1 ≈ 30min · 2 ≈ 1h · 3 ≈ 2-3h · 5 ≈ meio dia · 8 ≈ 1 dia
> · 13 ≈ 2 dias

---

## Legenda de Tipos de Ticket

| Tipo        | Descrição                                     |
| ----------- | --------------------------------------------- |
| 🐛 BUG      | Comportamento incorreto já existente          |
| ✨ FEAT     | Nova funcionalidade                           |
| ♻️ REFACTOR | Melhoria técnica sem mudança de comportamento |

---

## FASE 2 — Segurança e Validação ✅ CONCLUÍDA

> Fase concluída. Fases 3 e 4 desbloqueadas.

### Gargalos identificados no código existente

---

#### 🐛 BUG-001 — Multer com `diskStorage` quebra o upload para o S3 ✅

**Arquivo:** `src/routes/image.ts`, `src/helpers/awsS3Upload.ts` **Problema:** O
multer estava configurado com `diskStorage`, que salva o arquivo em disco.
`awsS3Upload` tenta acessar `file.buffer` para enviar ao S3, porém com
`diskStorage` o `buffer` é `undefined`. O upload nunca funciona corretamente.
**Fix:** Substituir a configuração do multer por
`multer({ storage: multer.memoryStorage() })`. **Status:** ✅ Implementado —
`multerUpload.ts` usa `multer.memoryStorage()`. **Story Points:** 2 SP

---

#### 🐛 BUG-002 — `forbiddenResponse()` retorna status 401 em vez de 403 ✅

**Arquivo:** `src/helpers/responses.ts` **Problema:** A função
`forbiddenResponse` usava `STATUS_CODE.UNAUTHORIZED` (401) em vez de
`STATUS_CODE.FORBIDDEN` (403), tornando os dois erros semanticamente
indistinguíveis para o cliente. **Fix:** Substituir pelo status correto
`STATUS_CODE.FORBIDDEN`. **Status:** ✅ Implementado — `forbiddenResponse` usa
`STATUS_CODE.FORBIDDEN` (403). **Story Points:** 1 SP

---

#### 🐛 BUG-003 — JWT assina uma string primitiva em vez de um payload estruturado ✅

**Arquivo:** `src/services/LoginService.ts` **Problema:**
`jwt.sign(name, secret)` assinava apenas o nome do usuário como string. Isso
impedia que o token carregasse `userId`, tornando impossível identificar o dono
de um recurso via token. Além disso, o JWT gerado não tinha `expiresIn`.
**Fix:** Refatorar para
`jwt.sign({ id, name, email }, secret, { expiresIn: '7d' })`. Atualizar a
assinatura de `signToken`. **Status:** ✅ Implementado — `signToken` usa
`jwt.sign({ id, name, email }, secret, { expiresIn: '15m' })` e
`signRefreshToken` assina com `expiresIn: '7d'`. **Story Points:** 3 SP

---

#### 🐛 BUG-004 — `generateImageId` usa bcrypt para gerar IDs de arquivo ✅

**Arquivo:** `src/helpers/generateImageId.ts` **Problema:** bcrypt foi projetado
para hash de senhas, não para geração de IDs. Além de ser lento (salt rounds),
os hashes gerados contêm `/` e `.`, que são caracteres problemáticos como S3
Object Keys e podem causar erros de path. **Fix:** Substituir por
`crypto.randomUUID()` (nativo do Node.js, sem dependências externas).
**Status:** ✅ Implementado — `generateImageId.ts` usa `crypto.randomUUID()`.
**Story Points:** 1 SP

---

#### ♻️ REFACTOR-001 — `ImageController` não usa o padrão `next(error)` para erros ✅

**Arquivo:** `src/controllers/ImageController.ts` **Problema:** O
`ImageController` capturava erros no `catch` e chamava `errorResponse`
diretamente, bypassando o `errorHandler` global. Isso era inconsistente com o
`UserController` e impedia que `AppError` com status codes específicos fosse
tratado corretamente. **Fix:** Adicionar o parâmetro `next: NextFunction` e
propagar erros via `next(error)`. **Status:** ✅ Implementado — `upload` e
`list` propagam via `next(error)`. **Story Points:** 2 SP

---

### Novas features

---

#### ✨ FEAT-001 — Criar middleware de autenticação JWT ✅

**Arquivo criado:** `src/middlewares/auth.ts` **Descrição:** Middleware que lê o
token do header `Authorization: Bearer <token>`, valida a assinatura, decodifica
o payload e injeta `req.user` (com `id`, `name`, `email`) na request. Lança
`UnauthorizedError` em caso de token ausente, inválido ou expirado. **Status:**
✅ Implementado — `auth.ts` cobre todos os casos. **Depende de:** BUG-003
**Story Points:** 5 SP

---

#### ✨ FEAT-002 — Estender `Request` do Express com tipagem de `req.user` ✅

**Arquivo criado:** `src/types/express.d.ts` **Descrição:** Declarar uma
extensão do namespace `Express.Request` para incluir o campo
`user?: { id: string; name: string; email: string }`. Isso garante type safety
ao acessar `req.user` nos controllers. **Status:** ✅ Implementado —
`express.d.ts` declara a extensão corretamente. **Depende de:** FEAT-001 **Story
Points:** 2 SP

---

#### ✨ FEAT-003 — Proteger rotas de imagem com o middleware de autenticação ✅

**Arquivo:** `src/routes/image.ts` **Descrição:** Aplicar o middleware
`authenticate` em todas as rotas de `/image`. Nenhuma operação de imagem deve
ser acessível sem um token válido. **Status:** ✅ Implementado — middleware
`auth` aplicado em todas as rotas de `/image`. **Depende de:** FEAT-001 **Story
Points:** 1 SP

---

#### ✨ FEAT-004 — Adicionar validação de schema com Zod para rotas de usuário ✅

**Arquivos:** `src/validators/userValidators.ts`,
`src/middlewares/validateRequestBody.ts` **Descrição:** Criar schemas Zod para
`register` (name, email, password com regras mínimas) e `login` (email,
password). Substituir as validações manuais (`if (!name || !email)`) por
validação via schema, com mensagens de erro padronizadas. **Status:** ✅
Implementado — `registerValidator`, `loginValidator` e middleware
`validateRequestBody` aplicados nas rotas. **Story Points:** 3 SP

---

#### ✨ FEAT-005 — Adicionar restrições de tipo e tamanho ao multer ⚠️

**Arquivo:** `src/helpers/multerUpload.ts`, `src/helpers/fileFilter.ts`
**Descrição:** Configurar o multer com: limite de tamanho de arquivo (ex: 10
MB), e filtro de tipo via `fileFilter` que rejeita mimetypes fora de
`image/jpeg`, `image/png`, `image/webp`, `image/gif`. Adicionar tratamento de
erro específico para `MulterError`. **Status:** ⚠️ Parcialmente implementado —
`fileFilter` (tipo) e `MulterError` handler estão feitos. **Falta:** a opção
`limits: { fileSize: 10 * 1024 * 1024 }` no multer de `multerUpload.ts`.
**Depende de:** BUG-001 **Story Points:** 3 SP

---

#### ✨ FEAT-026 — Implementar rate limiting nas rotas de transformação ⚠️

**Arquivo:** `src/middlewares/rateLimit.ts` **Descrição:** Usar
`express-rate-limit` para limitar o número de requisições ao endpoint
`POST /image/:id/transform` por IP e/ou por `userId`. Configuração sugerida:
máximo de 20 requisições por minuto por usuário. Retornar
`429 Too Many Requests` com mensagem clara ao exceder o limite. O limite pode
ser configurável via variável de ambiente. **Status:** ⚠️ Parcialmente
implementado — rate limiter global (`express-rate-limit`) implementado e
configurável via `REQUEST_LIMIT`. **Falta:** escopo específico ao
`POST /image/:id/transform` com chave por `userId`. **Story Points:** 2 SP

---

**Total estimado Fase 2: 25 SP — ✅ CONCLUÍDA** (2 itens com pendências menores:
FEAT-005 sem `fileSize`, FEAT-026 não específico ao `/transform`)

```
BUG-001 ──► FEAT-005 ⚠️
BUG-002 ✅ (independente)
BUG-003 ──► FEAT-001 ──► FEAT-002 ──► FEAT-003 ✅
BUG-004 ✅ (independente)
REFACTOR-001 ✅ (independente)
FEAT-004 ✅ (independente)
FEAT-026 ⚠️ (global · refinar ao /transform na Fase 3)
```

---

## FASE 3 — Gerenciamento de Imagens 🔴 EM ANDAMENTO

> **Fase 2 concluída.** `req.user` disponível. Todos os pré-requisitos
> satisfeitos.

### Gargalos identificados no código existente

---

#### 🐛 BUG-005 — `ImageService.upload()` retorna `void`, perdendo os dados da imagem criada

**Arquivo:** `src/services/ImageService.ts` **Problema:** O método `upload`
chama `awsS3Upload` e descarta o retorno sem passar o objeto `IImage` de volta
ao controller. O cliente nunca recebe os dados da imagem criada. **Fix:**
Retornar o `IImage` criado pelo `awsS3Upload` após o `repository.save`. **Story
Points:** 1 SP

---

#### 🐛 BUG-006 — `ImageController.upload()` não envia os dados da imagem na resposta

**Arquivo:** `src/controllers/ImageController.ts` **Problema:** Mesmo que o
service retorne o `IImage`, o controller chama `successResponse` sem passar o
objeto como `data`. O cliente recebe apenas uma mensagem de texto. **Fix:**
Capturar o retorno de `service.upload()` e passá-lo como segundo argumento para
`successResponse`. **Depende de:** BUG-005 **Story Points:** 1 SP

---

#### 🐛 BUG-007 — `ImageController.list()` retorna mensagem de upload em vez dos dados da listagem

**Arquivo:** `src/controllers/ImageController.ts` **Problema:** O método `list`
chama `service.list()` corretamente, mas a mensagem de sucesso diz "File
uploaded successfully" e o array de imagens nunca é incluído na resposta.
**Fix:** Corrigir a mensagem e passar o array `images` como `data` na resposta.
**Story Points:** 1 SP

---

### Novas features

---

#### ✨ FEAT-006 — Adicionar campo `userId` ao schema e DTO de imagem

**Arquivos:** `src/dto/IImage.ts`, `src/schemas/image.ts` **Descrição:**
Adicionar o campo `userId: string` ao DTO `IImage` e ao schema Mongoose
`imageSchema`. Esse campo deve ser obrigatório e criar um index para permitir
queries eficientes de listagem por usuário. **Story Points:** 2 SP

---

#### ✨ FEAT-007 — Atualizar `ImageRepository` para operar com `userId`

**Arquivo:** `src/repositories/image/ImageRepository.ts` **Descrição:**

- Método `save`: já recebe `IImage`, nenhuma mudança de assinatura (o `userId`
  virá no objeto).
- Método `list`: adicionar parâmetro `userId: string` e filtrar por `{ userId }`
  no `Image.find()`.
- Novo método
  `findById(imageId: string, userId: string): Promise<IImage | null>`.
- Novo método `delete(imageId: string, userId: string): Promise<void>`.
  **Depende de:** FEAT-006 **Story Points:** 3 SP

---

#### ✨ FEAT-008 — Atualizar `ImageService` para receber `userId` e escopar operações

**Arquivo:** `src/services/ImageService.ts` **Descrição:**

- `upload(file, userId)`: passa `userId` ao objeto `IImage` antes de salvar.
  Retorna `IImage`.
- `list(userId)`: repassa o `userId` ao repository.
- Novo método `getById(imageId, userId)`: busca imagem, lança `NotFoundError` se
  não encontrada.
- Novo método `delete(imageId, userId)`: remove do S3 e do MongoDB. **Depende
  de:** FEAT-007, BUG-005 **Story Points:** 5 SP

---

#### ✨ FEAT-009 — Implementar endpoint `GET /image/:id` (recuperar imagem por ID)

**Arquivos:** `src/controllers/ImageController.ts`, `src/routes/image.ts`
**Descrição:** Adicionar método `getById` no controller que lê `req.params.id` e
`req.user.id`, chama `service.getById()` e retorna o objeto `IImage` (com a URL
pré-assinada). Registrar a rota com autenticação. **Depende de:** FEAT-008,
FEAT-002 **Story Points:** 3 SP

---

#### ✨ FEAT-010 — Implementar endpoint `DELETE /image/:id`

**Arquivos:** `src/controllers/ImageController.ts`, `src/routes/image.ts`,
`src/helpers/awsS3Upload.ts` **Descrição:**

- Adicionar helper `awsS3Delete(imageId: string)` em `awsS3Upload.ts` (ou
  arquivo separado) que usa `DeleteObjectCommand`.
- Adicionar método `delete` no controller.
- Registrar rota `DELETE /image/:id` com autenticação.
- Garantir que apenas o dono da imagem possa deletá-la (verificação via
  `userId`). **Depende de:** FEAT-008, FEAT-002 **Story Points:** 5 SP

---

#### ✨ FEAT-011 — Escopar listagem de imagens ao usuário autenticado

**Arquivo:** `src/controllers/ImageController.ts` **Descrição:** Atualizar
`ImageController.list()` para extrair `req.user.id` e passá-lo a
`service.list(userId)`, garantindo que cada usuário veja apenas suas próprias
imagens. **Depende de:** FEAT-008, FEAT-002 **Story Points:** 2 SP

---

**Total estimado Fase 3: 23 SP**

```
FEAT-006
    │
    ▼
FEAT-007
    │
    ▼
FEAT-008 ──┬──► FEAT-009
BUG-005 ───┘    FEAT-010
BUG-006         FEAT-011
BUG-007
```

---

## FASE 4 — Transformações de Imagem

> **Depende da Fase 2.** Pode ser desenvolvida **em paralelo com a Fase 3**.

---

#### ✨ FEAT-012 — Instalar e configurar a biblioteca `sharp`

**Descrição:** Adicionar `sharp` e `@types/sharp` às dependências. Verificar
integração com o ambiente TypeScript do projeto. **Story Points:** 1 SP

---

#### ✨ FEAT-013 — Criar DTO para parâmetros de transformação

**Arquivo a criar:** `src/dto/ITransformOptions.ts` **Descrição:** Definir
interface tipada `ITransformOptions` cobrindo todos os parâmetros de
transformação: `resize?: { width, height, fit }`,
`crop?: { left, top, width, height }`, `rotate?: number`, `flip?: boolean`,
`mirror?: boolean`, `compress?: { quality }`,
`format?: 'jpeg' | 'png' | 'webp'`, `filters?: { grayscale?, sepia? }`. **Story
Points:** 3 SP

---

#### ✨ FEAT-014 — Criar validação Zod para `ITransformOptions` ✅

**Arquivo a criar:** `src/validators/transformValidators.ts` **Descrição:**
Criar schema Zod correspondente ao `ITransformOptions`, com validações de range
(ex: quality entre 1–100, rotate entre 0–360). Será usado no controller para
validar o body da requisição. **Depende de:** FEAT-013 **Status:** ✅
Implementado — `transformValidator` cobre todos os campos com ranges em
`quality` (1–100) e `rotate` (0–360). **Story Points:** 3 SP

---

#### ✨ FEAT-015 — Implementar `TransformService` — operações geométricas ✅

**Arquivo a criar:** `src/services/TransformService.ts` **Descrição:**
Implementar as transformações: `resize`, `crop`, `rotate`, `flip`, `mirror`
usando a API encadeável do `sharp`. O service deve receber `buffer: Buffer` e
`options: ITransformOptions` e retornar o `Buffer` transformado. **Depende de:**
FEAT-012, FEAT-013 **Status:** ✅ Implementado — `TransformService.transform()`
aplica resize, crop, rotate, flip e mirror via pipeline `sharp`. **Story
Points:** 8 SP

---

#### ✨ FEAT-016 — Implementar `TransformService` — compressão e conversão de formato ✅

**Arquivo:** `src/services/TransformService.ts` **Descrição:** Adicionar ao
`TransformService` o suporte a `compress` (ajustar qualidade) e `format`
(converter para jpeg, png, webp). Atenção ao comportamento do `sharp` com
formatos que não suportam certas configurações (ex: png ignora `quality`).
**Depende de:** FEAT-015 **Status:** ✅ Implementado — pipeline aplica
`.jpeg()`, `.webp()` ou `.png()` conforme `format`; `compress.quality` é
ignorado silenciosamente pelo png. **Story Points:** 5 SP

---

#### ✨ FEAT-017 — Implementar `TransformService` — filtros visuais ✅

**Arquivo:** `src/services/TransformService.ts` **Descrição:** Adicionar filtros
`grayscale` (via `sharp().grayscale()`) e `sepia` (via composição de matrix de
cores com `sharp().recomb()`). **Depende de:** FEAT-015 **Status:** ✅
Implementado — `grayscale` via `.grayscale()`, `sepia` via `.recomb()` com
matrix de luminância padrão (`Matrix3x3`). **Story Points:** 3 SP

---

#### ✨ FEAT-019 — Implementar `TransformController` e endpoint `POST /image/:id/transform`

**Arquivos:** `src/controllers/TransformController.ts` (novo),
`src/routes/image.ts` **Descrição:** Controller que:

1. Autentica o usuário via `req.user`.
2. Busca a imagem original pelo `imageId` (via `ImageService.getById`).
3. Faz download do arquivo original do S3 para um `Buffer`.
4. Valida o body da requisição com o schema Zod de `ITransformOptions`.
5. Chama `TransformService` com o buffer e as opções.
6. Faz upload do resultado transformado ao S3 como nova imagem.
7. Retorna o `IImage` da imagem transformada. **Depende de:** FEAT-014,
   FEAT-015, FEAT-016, FEAT-017, FEAT-018, FEAT-009 **Story Points:** 8 SP

---

#### ✨ FEAT-027 — Implementar cache Redis para imagens transformadas

**Arquivos a criar:** `src/config/cache.ts`, `src/services/CacheService.ts`
**Descrição:** Configurar uma instância do Redis (`ioredis`). Criar um
`CacheService` com métodos `get(key)` e `set(key, value, ttl)`. A chave de cache
deve ser um hash determinístico composto pelo `imageId` + os parâmetros de
transformação serializados (ex: `sha256(imageId + JSON.stringify(options))`). No
`TransformController`, antes de processar, verificar o cache; se houver hit,
retornar o resultado cacheado diretamente. TTL sugerido: 24h. Adicionar o
serviço Redis ao `docker-compose.yml`. **Depende de:** FEAT-019 **Story
Points:** 8 SP

---

#### ✨ FEAT-028 — [OPCIONAL] Implementar pipeline assíncrono de transformações com Kafka

**Arquivos a criar:** `src/config/kafka.ts`, `src/jobs/TransformConsumer.ts`,
`src/jobs/TransformProducer.ts` **Descrição:** Desacoplar a execução da
transformação do ciclo request-response. O `TransformController` publica uma
mensagem no tópico `image.transform` com `{ jobId, imageId, userId, options }` e
retorna imediatamente `202 Accepted` com o `jobId`. Um consumer Kafka processa
os jobs em background, executa a transformação, salva o resultado e atualiza o
status no MongoDB. O cliente pode consultar o status via
`GET /image/jobs/:jobId`. Adicionar o serviço Kafka ao `docker-compose.yml`.
**Depende de:** FEAT-019, FEAT-027 **Observação:** Ticket opcional. Implementar
somente se performance sob carga for um requisito concreto. **Story Points:** 13
SP

---

**Total estimado Fase 4: 57 SP**

```
FEAT-012
    │
FEAT-013 ──► FEAT-014
    │
FEAT-015
    ├──► FEAT-016
    ├──► FEAT-017
    └──► FEAT-018
              │
         FEAT-019 (depende de tudo acima + FEAT-009 da Fase 3)
```

---

## FASE 5 — Qualidade e Produção

> Pode ser iniciada gradualmente a partir da Fase 3 (ex: testes unitários são
> escritos à medida que os services são criados).

---

#### ✨ FEAT-020 — Adicionar paginação ao endpoint de listagem

**Arquivo:** `src/repositories/image/ImageRepository.ts`,
`src/services/ImageService.ts`, `src/controllers/ImageController.ts`
**Descrição:** Adicionar suporte a query params `page` e `limit` no endpoint
`GET /image/list`. Retornar junto aos dados: `total`, `page`, `totalPages`.
**Story Points:** 3 SP

---

#### ✨ FEAT-021 — Implementar sistema de logging com Winston

**Arquivo a criar:** `src/config/logger.ts` **Descrição:** Configurar uma
instância do `winston` com transports de `console` (dev) e `file` (prod).
Substituir `console.log` / `console.error` espalhados no código pela instância
do logger. Logar erros no `errorHandler`. **Story Points:** 3 SP

---

#### ✨ FEAT-022 — Completar Docker Compose com o serviço da aplicação

**Arquivo:** `docker-compose.yml` **Descrição:** Adicionar o serviço `app` ao
`docker-compose.yml` com: build via `Dockerfile` (a criar), variáveis de
ambiente, dependência do serviço `mongo`, e mapeamento de portas. **Story
Points:** 3 SP

---

#### ✨ FEAT-023 — Escrever testes unitários para services e helpers

**Arquivos a criar:** `src/__tests__/unit/` **Descrição:** Cobrir com testes
unitários: `LoginService`, `UserService`, `ImageService`, `TransformService` e
os helpers (`awsS3Upload`, `generateImageId`). Usar `jest` com mocks para
repositórios e dependências externas (S3, bcrypt). **Story Points:** 13 SP

---

#### ✨ FEAT-024 — Escrever testes de integração para os endpoints

**Arquivos a criar:** `src/__tests__/integration/` **Descrição:** Cobrir com
testes de integração os endpoints usando `supertest` e um banco MongoDB em
memória (`mongodb-memory-server`). Fluxos a cobrir: register → login → upload →
list → getById → delete → transform. **Story Points:** 8 SP

---

#### ✨ FEAT-025 — Completar README com instruções de setup e documentação da API

**Arquivo:** `README.md` **Descrição:** Documentar: pré-requisitos, variáveis de
ambiente necessárias (`.env.example`), como rodar com e sem Docker, e uma
referência rápida de todos os endpoints com exemplos de request/response.
**Story Points:** 3 SP

---

#### ✨ FEAT-029 — Auditoria de tratamento de erros e validação em todos os endpoints

**Arquivos:** todos os controllers e rotas **Descrição:** Revisão transversal
para garantir que **todos** os endpoints possuem: (1) validação de input via Zod
com mensagens descritivas; (2) erros propagados via `next(error)` para o
`errorHandler` global; (3) nenhum erro sensível exposto na resposta (stack
traces, detalhes internos); (4) respostas HTTP semanticamente corretas (status
codes adequados). Cobrir rotas de imagem (upload, list, getById, delete,
transform) e usuário (register, login). Esta tarefa consolida e fecha lacunas
não capturadas por tickets anteriores. **Depende de:** FEAT-004, FEAT-005,
FEAT-014, REFACTOR-001, FEAT-019 **Story Points:** 5 SP

---

**Total estimado Fase 5: 41 SP**

---

## Resumo de Estimativas por Fase

| Fase                    | Tickets        | Story Points | Paralela com       |
| ----------------------- | -------------- | ------------ | ------------------ |
| Fase 2 — Segurança      | 10 tickets     | 25 SP        | —                  |
| Fase 3 — Gerenciamento  | 10 tickets     | 23 SP        | Fase 4             |
| Fase 4 — Transformações | 10 tickets     | 57 SP        | Fase 3             |
| Fase 5 — Qualidade      | 7 tickets      | 41 SP        | Inicia na Fase 3/4 |
| **Total**               | **37 tickets** | **146 SP**   |                    |

---

## Grafo de Dependências Técnicas

```
[BUG-001] ──────────────────────────────────► [FEAT-005]
[BUG-002]  (independente)
[BUG-003] ──► [FEAT-001] ──► [FEAT-002] ──► [FEAT-003]
[BUG-004]  (independente)                         │
[REFACTOR-001] (independente)                     │
[FEAT-004]  (independente)                        │
                                                  ▼
         ┌────────────────────────────────────────┤
         │            Fase 2 concluída            │
         └──────────────┬─────────────────────────┘
                        │
          ┌─────────────┴────────────────────┐
          ▼                                  ▼
   [FASE 3]                          [FASE 4]
   FEAT-006                          FEAT-012
       │                                 │
   FEAT-007                          FEAT-013 ──► FEAT-014
       │                                 │
   FEAT-008 ──► FEAT-009, 010, 011   FEAT-015
                    │                    ├── FEAT-016
                    │                    ├── FEAT-017
                    └────────────────────┴── FEAT-018
                                                 │
                                             FEAT-019
                                                 │
                                          FEAT-027 (cache)
                                                 │
                                    FEAT-028 (Kafka, opcional)
                    ─────────────────────────────┘
                    │         Fases 3+4 concluídas
                    ▼
                 [FASE 5]
          FEAT-020, 021, 022, 023, 024, 025, 029
```

---

## Ordem de execução sugerida

**Sprint 1** — Fase 2 completa (desbloqueante)

> BUG-001 → BUG-002 → BUG-003 → BUG-004 → REFACTOR-001 → FEAT-001 → FEAT-002 →
> FEAT-003 → FEAT-004 → FEAT-005

**Sprint 2** — Fase 3 + início Fase 4 (em paralelo)

> Track A (Fase 3): BUG-005 → BUG-006 → BUG-007 → FEAT-006 → FEAT-007 → FEAT-008
> → FEAT-009 → FEAT-010 → FEAT-011 Track B (Fase 4): FEAT-012 → FEAT-013 →
> FEAT-014 → FEAT-015 → FEAT-016

**Sprint 3** — Fim Fase 4 + início Fase 5

> Fase 4: FEAT-017 → FEAT-018 → FEAT-019 → FEAT-027 → FEAT-028 (opcional) Fase
> 5: FEAT-020 → FEAT-021 → FEAT-022

**Sprint 4** — Finalização

> FEAT-023 → FEAT-024 → FEAT-025
