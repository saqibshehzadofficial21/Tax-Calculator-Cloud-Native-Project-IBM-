# Project Management — Cloud-Native Tax Calculator

## Epic

**EPIC-001: Cloud-Native Modernisation and CI/CD Automation of the Tax Calculator Application**

**Description:**  
Deliver a production-quality, containerised Tax Calculator web application with automated unit testing, IBM Cloud Container Registry publication, IBM Cloud Kubernetes deployment, and a fully automated Tekton CI/CD pipeline that progresses from source code through testing, image build, and deployment with zero manual steps.

**Priority:** High  
**Status:** In Progress  
**Objective:** Satisfy all requirements of the Introduction to Cloud Native final project rubric.

---

## User Stories

### US-01 — Automated Jasmine Unit Tests

| Field | Detail |
|---|---|
| **ID** | US-01 |
| **Title** | Automated Jasmine Unit Tests |
| **Priority** | High |
| **Epic** | EPIC-001 |

**Description:**  
As a developer, I want comprehensive Jasmine unit tests for the tax calculation logic so that calculation correctness and input validation are verified automatically on every change.

**Acceptance Criteria:**
- [ ] Test suite contains a minimum of 7 passing specs.
- [ ] Tests cover the zero-income case.
- [ ] Tests cover an income that falls in the first (zero-rate) bracket.
- [ ] Tests cover progressive multi-bracket calculation.
- [ ] Tests verify the monthly tax calculation.
- [ ] Tests verify that negative income raises `RangeError`.
- [ ] Tests verify that non-numeric income raises `TypeError`.
- [ ] Tests cover at least one bracket boundary condition.
- [ ] `npm test` or `npx jasmine` outputs `X specs, 0 failures`.
- [ ] No test spec fabricates an expected result.

**Definition of Done:**  
`npx jasmine` produces `7 specs, 0 failures`. Output is captured in `evidence/01-jasmine-tests-passing.txt`.

---

### US-02 — Docker Containerisation

| Field | Detail |
|---|---|
| **ID** | US-02 |
| **Title** | Docker Containerisation of the Application |
| **Priority** | High |
| **Epic** | EPIC-001 |

**Description:**  
As a developer, I want a production-quality Dockerfile so that the Tax Calculator can be built into a portable, secure, and consistent container image.

**Acceptance Criteria:**
- [ ] Dockerfile uses `node:20-alpine` or equivalent stable base image.
- [ ] Working directory is set to `/app`.
- [ ] Only production dependencies are installed (`--omit=dev`).
- [ ] Application source code and public assets are copied.
- [ ] Container runs as non-root (`USER node`).
- [ ] Port 3000 is exposed.
- [ ] `HEALTHCHECK` is configured against `GET /health`.
- [ ] `.dockerignore` excludes `node_modules`, `.git`, and test files.
- [ ] `docker build -t tax-calculator:latest .` completes without error.
- [ ] Image size is reasonable (under 250 MB).

**Definition of Done:**  
Image builds successfully. Output captured in `evidence/02-docker-build.txt`.

---

### US-03 — Local Docker Container Testing

| Field | Detail |
|---|---|
| **ID** | US-03 |
| **Title** | Local Container Run and Verification |
| **Priority** | High |
| **Epic** | EPIC-001 |

**Description:**  
As a tester, I want to run the Docker image locally so that I can confirm the container starts, serves the UI, and passes the health check before publishing to the registry.

**Acceptance Criteria:**
- [ ] `docker run -d --name tax-calculator -p 3000:3000 tax-calculator:latest` starts the container.
- [ ] `docker ps` shows the container as `Up` and `(healthy)`.
- [ ] `GET /health` returns `{"status":"ok"}` with HTTP 200.
- [ ] `POST /api/tax/calculate` with `{"annualIncome":1400000}` returns correct tax values.
- [ ] UI is accessible at `http://localhost:3000`.
- [ ] `docker logs tax-calculator` shows the startup message.

**Definition of Done:**  
Container is verified running and API responds correctly. Output captured in `evidence/03-docker-container-running.txt`.

---

### US-04 — IBM Cloud Container Registry Publication

| Field | Detail |
|---|---|
| **ID** | US-04 |
| **Title** | Push Image to IBM Cloud Container Registry |
| **Priority** | High |
| **Epic** | EPIC-001 |

**Description:**  
As a release engineer, I want to tag and push the local Docker image to IBM Cloud Container Registry so that it is available for cloud deployment.

**Acceptance Criteria:**
- [ ] `ibmcloud login` authenticates successfully.
- [ ] Container Registry plugin is installed and `ibmcloud cr region-set` targets the correct region.
- [ ] A suitable namespace exists or is created.
- [ ] `ibmcloud cr login` completes Docker authentication.
- [ ] Image is tagged as `us.icr.io/NAMESPACE/tax-calculator:v1`.
- [ ] `docker push` completes without error.
- [ ] `ibmcloud cr images` lists the pushed tag.
- [ ] No credentials, API keys, or tokens are stored in any project file.

**Definition of Done:**  
Image appears in `ibmcloud cr images` output. Evidence captured in `evidence/04-ibm-container-registry.txt`.

---

### US-05 — IBM Cloud Kubernetes Deployment

| Field | Detail |
|---|---|
| **ID** | US-05 |
| **Title** | Deploy Application to IBM Cloud Kubernetes Service |
| **Priority** | High |
| **Epic** | EPIC-001 |

**Description:**  
As a user, I want the Tax Calculator deployed on IBM Cloud Kubernetes Service so that I can access it through a stable public service endpoint.

**Acceptance Criteria:**
- [ ] `kubectl apply -f k8s/deployment.yaml` (with correct image) succeeds.
- [ ] Deployment reaches `READY 2/2` replicas.
- [ ] All pods pass readiness and liveness probes.
- [ ] Service of type `LoadBalancer` is created.
- [ ] `kubectl rollout status` confirms successful rollout.
- [ ] Application UI is reachable at the external service IP.
- [ ] `GET /health` at the external IP returns HTTP 200.
- [ ] Resource requests and limits are configured.

**Definition of Done:**  
Deployment is verified ready in the cluster. Evidence captured in `evidence/05-ibm-cloud-deployment.txt`.

---

### US-06 — Reusable Tekton Tasks

| Field | Detail |
|---|---|
| **ID** | US-06 |
| **Title** | Create Reusable Tekton CI/CD Tasks |
| **Priority** | High |
| **Epic** | EPIC-001 |

**Description:**  
As a pipeline author, I want three independently defined, reusable Tekton Tasks for testing, building/pushing, and deploying so that each stage is encapsulated and can be executed or updated individually.

**Acceptance Criteria:**
- [ ] `tekton/tasks/test.yaml` defines `tax-calculator-test` Task.
- [ ] Test task installs dev dependencies and runs `npm run test:ci`.
- [ ] Test task fails the TaskRun if Jasmine reports failures.
- [ ] `tekton/tasks/build-push.yaml` defines `tax-calculator-build-push` Task.
- [ ] Build/push task uses Kaniko executor.
- [ ] Build/push task accepts `IMAGE` and `TAG` parameters.
- [ ] Build/push task uses a secure registry credential secret.
- [ ] `tekton/tasks/deploy.yaml` defines `tax-calculator-deploy` Task.
- [ ] Deploy task accepts `IMAGE` parameter with registry path and tag.
- [ ] Deploy task waits for rollout and fails if it does not complete.
- [ ] `tkn task list` shows all three tasks after `kubectl apply`.

**Definition of Done:**  
All three YAML files exist, are syntactically valid, and are applied successfully. Evidence in `evidence/06-tekton-tasks.txt`.

---

### US-07 — Automated Tekton Pipeline

| Field | Detail |
|---|---|
| **ID** | US-07 |
| **Title** | Tekton Pipeline Connecting All CI/CD Stages |
| **Priority** | High |
| **Epic** | EPIC-001 |

**Description:**  
As a release engineer, I want a Tekton Pipeline that connects the clone, test, build/push, and deploy tasks in sequence so that the entire CI/CD workflow executes automatically in a single PipelineRun.

**Acceptance Criteria:**
- [ ] `tekton/pipeline.yaml` defines `tax-calculator-ci-cd` Pipeline.
- [ ] Pipeline clones source via `git-clone` hub task.
- [ ] Tests run after clone and before build.
- [ ] Build/push runs after tests pass.
- [ ] Deploy runs after build/push succeeds.
- [ ] `runAfter` is correctly configured on all tasks.
- [ ] Pipeline accepts `git-url`, `git-revision`, `image`, `tag` parameters.
- [ ] `tekton/pipelinerun.yaml` provides a complete PipelineRun template.
- [ ] A successful PipelineRun shows all tasks as `Succeeded`.

**Definition of Done:**  
Pipeline is applied and `tkn pipeline list` confirms it. PipelineRun template is ready. Evidence in `evidence/07-tekton-pipeline.txt`.

---

### US-08 — Continuous Deployment with Image Consistency

| Field | Detail |
|---|---|
| **ID** | US-08 |
| **Title** | Deploy the Exact Image Built by the Pipeline |
| **Priority** | High |
| **Epic** | EPIC-001 |

**Description:**  
As an operator, I want the pipeline's deploy stage to use the exact image repository and tag produced by the build stage so that the deployed version always matches the tested and published release.

**Acceptance Criteria:**
- [ ] Deploy task receives `$(params.image):$(params.tag)` from the pipeline.
- [ ] Pipeline parameters `image` and `tag` are consistently propagated from build to deploy.
- [ ] No hardcoded image references in the deploy task.
- [ ] `kubectl rollout status` completes successfully for the deployed version.
- [ ] Post-deployment verification confirms the correct image tag is running.
- [ ] `kubectl get pods -o jsonpath` shows the pipeline-built image on all running pods.

**Definition of Done:**  
PipelineRun completes successfully. Deployed pod image tag matches the pipeline's `$(params.tag)`. Evidence captured in `evidence/08-tekton-pipelinerun.txt`.

---

## Implementation Task Breakdown

| Task | User Stories | File | Status |
|---|---|---|---|
| T-01: Add 7th Jasmine spec | US-01 | `spec/tax.spec.js` | ✅ Done |
| T-02: Upgrade UI/UX | — | `public/index.html`, `styles.css`, `app.js` | ✅ Done |
| T-03: Improve server routes | — | `src/server.js` | ✅ Done |
| T-04: Review Dockerfile | US-02 | `Dockerfile` | ✅ Done |
| T-05: Build Docker image | US-02/03 | — | ✅ Built |
| T-06: Run Docker container | US-03 | — | ✅ Running |
| T-07: IBM CR push | US-04 | — | 🔄 Pending |
| T-08: Kubernetes deploy | US-05 | `k8s/deployment.yaml` | 🔄 Pending |
| T-09: Tekton test task | US-06 | `tekton/tasks/test.yaml` | ✅ Done |
| T-10: Tekton build task | US-06 | `tekton/tasks/build-push.yaml` | ✅ Done |
| T-11: Tekton deploy task | US-06 | `tekton/tasks/deploy.yaml` | ✅ Done |
| T-12: Tekton pipeline | US-07/08 | `tekton/pipeline.yaml` | ✅ Done |
| T-13: PipelineRun | US-07/08 | `tekton/pipelinerun.yaml` | 🔄 Pending cluster |
| T-14: Project docs | — | `docs/PROJECT-MANAGEMENT.md` | ✅ Done |
| T-15: README | — | `README.md` | ✅ Done |

**Legend:** ✅ Complete · 🔄 Pending cloud/cluster access
