# TaxCalc Pro — Cloud-Native Tax Calculator

> **Introduction to Cloud Native · Final Project**  
> A production-quality, containerised, full-stack tax calculator with automated Jasmine testing, Docker packaging, IBM Cloud deployment, and Tekton CI/CD automation.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Objectives](#2-project-objectives)
3. [Technology Stack](#3-technology-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Project Structure](#5-project-structure)
6. [Installation Requirements](#6-installation-requirements)
7. [Local Setup](#7-local-setup)
8. [Testing](#8-testing)
9. [API Documentation](#9-api-documentation)
10. [Docker Workflow](#10-docker-workflow)
11. [IBM Cloud Container Registry](#11-ibm-cloud-container-registry)
12. [IBM Cloud Deployment](#12-ibm-cloud-deployment)
13. [Tekton Tasks](#13-tekton-tasks)
14. [Tekton Pipeline](#14-tekton-pipeline)
15. [Pipeline Execution](#15-pipeline-execution)
16. [Troubleshooting](#16-troubleshooting)
17. [Security Considerations](#17-security-considerations)
18. [Evidence Checklist](#18-evidence-checklist)
19. [Known Limitations](#19-known-limitations)

---

## 1. Project Overview

TaxCalc Pro is a cloud-native web application that calculates progressive income tax, monthly tax, take-home income, and effective tax rate based on configurable tax brackets. The project demonstrates full cloud-native engineering practices:

- **Tested** — 7 Jasmine unit tests covering zero income, bracket boundaries, progressive calculation, monthly derivation, and invalid inputs.
- **Containerised** — Multi-stage-ready Dockerfile using `node:20-alpine`, non-root user, health check.
- **Cloud-deployed** — IBM Cloud Kubernetes Service with Deployment, Service, readiness/liveness probes, and resource limits.
- **Automated** — Tekton CI/CD pipeline: source clone → test → build/push → deploy.

> **Tax brackets note:** The included progressive brackets are illustrative test data. Replace `TAX_BRACKETS` in `src/tax.js` with your assignment's required formula before submission.

---

## 2. Project Objectives

| Part       | Objective                                                           |
| ---------- | ------------------------------------------------------------------- |
| **Part A** | Project management: Epic, user stories, acceptance criteria, tasks  |
| **Part B** | Application testing, containerisation, IBM Cloud CR, IKS deployment |
| **Part C** | Tekton CI/CD tasks, pipeline, and PipelineRun execution             |

---

## 3. Technology Stack

| Category        | Technology                   |
| --------------- | ---------------------------- |
| Runtime         | Node.js 20 (LTS)             |
| Framework       | Express 4                    |
| Tests           | Jasmine 5                    |
| Container       | Docker (node:20-alpine)      |
| Orchestration   | Kubernetes (IBM Cloud IKS)   |
| Image Registry  | IBM Cloud Container Registry |
| CI/CD           | Tekton Pipelines v1          |
| Image Builder   | Kaniko                       |
| Package Manager | npm                          |
| OS (dev)        | Windows 11 / PowerShell      |

---

## 4. Architecture Overview

```
Browser
   │
   ▼
┌────────────────────────────────────────────────────┐
│  Node.js / Express  (port 3000)                    │
│  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Static Files │  │ REST API                 │   │
│  │ /public      │  │ GET  /health             │   │
│  │ index.html   │  │ GET  /api                │   │
│  │ app.js       │  │ GET  /api/tax/brackets   │   │
│  │ styles.css   │  │ POST /api/tax/calculate  │   │
│  └──────────────┘  └──────────────────────────┘   │
│                              │                      │
│                      ┌───────▼──────┐              │
│                      │  src/tax.js  │              │
│                      │  (business   │              │
│                      │   logic)     │              │
│                      └──────────────┘              │
└────────────────────────────────────────────────────┘
         │
    Docker Container
         │
  IBM Cloud IKS
  (Kubernetes Deployment + LoadBalancer Service)
         │
  Tekton Pipeline (CI/CD automation)
```

---

## 5. Project Structure

```
Tax-Calculator-Cloud-Native-Project/
├── src/
│   ├── server.js              # Express application and routes
│   └── tax.js                 # Tax calculation business logic
├── public/
│   ├── index.html             # Professional UI (TaxCalc Pro)
│   ├── styles.css             # Full dashboard styling
│   └── app.js                 # Frontend JavaScript (fetch, validation, charts)
├── spec/
│   ├── tax.spec.js            # Jasmine unit tests (7 specs)
│   └── support/
│       └── jasmine.json       # Jasmine configuration
├── k8s/
│   └── deployment.yaml        # Kubernetes Deployment + LoadBalancer Service
├── tekton/
│   ├── pipeline.yaml          # CI/CD pipeline definition
│   ├── pipelinerun.yaml       # PipelineRun template
│   ├── tasks/
│   │   ├── test.yaml          # Jasmine test task
│   │   ├── build-push.yaml    # Kaniko build and push task
│   │   └── deploy.yaml        # Kubernetes deployment task
│   └── config/
│       ├── workspace-pvc.yaml # Source workspace PVC
│       └── rbac.yaml          # Service account + RBAC
├── evidence/
│   ├── 01-jasmine-tests-passing.txt
│   ├── 02-docker-build.txt
│   ├── 03-docker-container-running.txt
│   ├── 04-ibm-container-registry.txt
│   ├── 05-ibm-cloud-deployment.txt
│   ├── 06-tekton-tasks.txt
│   ├── 07-tekton-pipeline.txt
│   └── 08-tekton-pipelinerun.txt
├── docs/
│   ├── PROJECT-MANAGEMENT.md  # Epic, user stories, tasks
│   └── SUBMISSION-CHECKLIST.md
├── Dockerfile
├── .dockerignore
├── package.json
├── .gitignore
└── README.md
```

---

## 6. Installation Requirements

| Requirement                                | Version | Purpose                           |
| ------------------------------------------ | ------- | --------------------------------- |
| Node.js                                    | 20+     | Run application and tests locally |
| npm                                        | 10+     | Package management                |
| Docker Desktop                             | 24+     | Build and run containers          |
| IBM Cloud CLI                              | Latest  | Cloud authentication and registry |
| `container-registry` plugin                | Latest  | IBM CR commands                   |
| `kubectl`                                  | 1.28+   | Kubernetes deployment             |
| Tekton CLI (`tkn`)                         | 0.35+   | Pipeline management               |
| A Kubernetes cluster with Tekton installed | —       | Part C execution                  |

---

## 7. Local Setup

```bash
# Clone or navigate to project
cd Tax-Calculator-Cloud-Native-Project

# Install dependencies
npm install

# Start the development server
npm start

# Open in browser
# http://localhost:3000
# http://localhost:3000/health
```

---

## 8. Testing

Run unit tests:

```bash
npx jasmine
```

Expected output:

```
Started
.......

7 specs, 0 failures
Finished in 0.008 seconds
```

**Test cases:**

| #   | Description                                 | Type       |
| --- | ------------------------------------------- | ---------- |
| 1   | Returns zero tax for zero income            | Happy path |
| 2   | Returns zero tax for first bracket income   | Boundary   |
| 3   | Calculates progressive multi-bracket tax    | Happy path |
| 4   | Derives monthly tax from annual tax         | Happy path |
| 5   | Rejects negative income (RangeError)        | Validation |
| 6   | Rejects non-numeric income (TypeError)      | Validation |
| 7   | Correct tax at exact upper bracket boundary | Boundary   |

---

## 9. API Documentation

### `GET /health`

Returns application health status.

```json
{
  "status": "ok",
  "service": "tax-calculator",
  "version": "1.0.0",
  "uptime": 42
}
```

### `GET /api`

Returns API metadata and endpoint list.

### `GET /api/tax/brackets`

Returns the configured tax brackets.

```json
{
  "brackets": [
    { "bracket": 1, "from": 0, "upTo": 600000, "rate": 0, "rateLabel": "0%" },
    { "bracket": 2, "from": 600000, "upTo": 1200000, "rate": 0.05, "rateLabel": "5%" },
    ...
  ],
  "note": "Illustrative brackets only. Not official tax advice."
}
```

### `POST /api/tax/calculate`

Calculates tax for a given annual income.

**Request:**

```json
{ "annualIncome": 1400000 }
```

**Response (200):**

```json
{
  "annualIncome": 1400000,
  "annualTax": 60000,
  "monthlyTax": 5000,
  "annualTakeHome": 1340000,
  "effectiveRate": 4.29
}
```

**Error Response (400):**

```json
{ "error": "annualIncome must be a non-negative finite number." }
```

---

## 10. Docker Workflow

```bash
# Build the image
docker build -t tax-calculator:latest .

# Run locally
docker run -d --name tax-calculator -p 3000:3000 tax-calculator:latest

# Verify container
docker ps
docker logs tax-calculator

# Test health
curl http://localhost:3000/health

# Stop and remove
docker stop tax-calculator
docker rm tax-calculator
```

**Dockerfile key features:**

- Base: `node:20-alpine` (minimal, secure)
- Non-root user: `USER node`
- Production deps only: `npm install --omit=dev`
- Health check: `HEALTHCHECK` against `/health`
- Port: `EXPOSE 3000`

---

## 11. IBM Cloud Container Registry

```bash
# Authenticate
ibmcloud login --sso
ibmcloud target -r us-south
ibmcloud plugin install container-registry -f
ibmcloud cr region-set us-south

# Check namespaces
ibmcloud cr namespace-list

# Authenticate Docker
ibmcloud cr login

# Set variables
export NAMESPACE=YOUR_NAMESPACE
export IMAGE=us.icr.io/$NAMESPACE/tax-calculator
export TAG=v1

# Tag and push
docker tag tax-calculator:latest $IMAGE:$TAG
docker push $IMAGE:$TAG

# Verify
ibmcloud cr images --restrict $NAMESPACE
```

> **Security:** Never store `IBM_CLOUD_API_KEY` or passwords in any project file, environment variable exports in shell scripts, or Git commits.

---

## 12. IBM Cloud Deployment

```bash
# Retrieve cluster kubeconfig
ibmcloud ks cluster config --cluster YOUR_CLUSTER_NAME

# Verify connectivity
kubectl config current-context
kubectl get nodes

# Deploy (replace IMAGE with actual registry path)
export IMAGE=us.icr.io/YOUR_NAMESPACE/tax-calculator:v1
sed "s|IMAGE_PLACEHOLDER|$IMAGE|g" k8s/deployment.yaml | kubectl apply -f -

# Monitor
kubectl rollout status deployment/tax-calculator

# Verify
kubectl get deployments,pods,services
kubectl get service tax-calculator --watch
```

The Service is type `LoadBalancer`. Once an external IP is assigned:

```bash
curl http://EXTERNAL_IP/health
```

---

## 13. Tekton Tasks

Three independent, reusable tasks:

| Task File                      | Name                        | Purpose                        |
| ------------------------------ | --------------------------- | ------------------------------ |
| `tekton/tasks/test.yaml`       | `tax-calculator-test`       | Install deps, run Jasmine      |
| `tekton/tasks/build-push.yaml` | `tax-calculator-build-push` | Kaniko build + IBM CR push     |
| `tekton/tasks/deploy.yaml`     | `tax-calculator-deploy`     | kubectl apply + rollout verify |

Apply all tasks:

```bash
kubectl apply -f tekton/tasks/test.yaml
kubectl apply -f tekton/tasks/build-push.yaml
kubectl apply -f tekton/tasks/deploy.yaml
tkn task list
```

---

## 14. Tekton Pipeline

The pipeline `tax-calculator-ci-cd` in `tekton/pipeline.yaml` connects all stages:

```
clone-source → test → build-push → deploy
```

Key parameters: `git-url`, `git-revision`, `image`, `tag`, `deploy-namespace`.

Apply:

```bash
kubectl apply -f tekton/config/workspace-pvc.yaml
kubectl apply -f tekton/config/rbac.yaml
kubectl apply -f tekton/pipeline.yaml
tkn pipeline list
```

---

## 15. Pipeline Execution

1. Create the registry secret (never commit credentials):

```bash
kubectl create secret docker-registry ibm-registry-auth \
  --docker-server=us.icr.io \
  --docker-username=iamapikey \
  --docker-password="$IBM_CLOUD_API_KEY" \
  --docker-email=unused@example.com
```

2. Edit `tekton/pipelinerun.yaml` — replace all `YOUR_*` placeholders.

3. Submit and monitor:

```bash
kubectl apply -f tekton/pipelinerun.yaml
tkn pipelinerun list
tkn pipelinerun logs --last -f
```

4. Verify:

```bash
kubectl rollout status deployment/tax-calculator
kubectl get pods
kubectl get service tax-calculator
```

---

## 16. Troubleshooting

| Issue                         | Resolution                                                |
| ----------------------------- | --------------------------------------------------------- |
| `docker: daemon not running`  | Start Docker Desktop                                      |
| `curl` POST fails on Windows  | Use `Invoke-RestMethod` in PowerShell                     |
| `ibmcloud: command not found` | Install IBM Cloud CLI from cloud.ibm.com/docs/cli         |
| Tekton PipelineRun stuck      | Check `tkn pipelinerun describe --last`; check pod events |
| `ImagePullBackOff` on cluster | Verify `ibm-registry-auth` secret and image path          |
| Kaniko auth failure           | Ensure `ibm-registry-auth` secret has correct credentials |
| `rollout status` timeout      | Check pod logs with `kubectl logs -l app=tax-calculator`  |

---

## 17. Security Considerations

- The application runs as non-root (`USER node`) inside the container.
- No credentials or secrets are stored in any project file.
- IBM Cloud API keys are injected at runtime via Kubernetes secrets.
- The `.dockerignore` excludes test files, `.git`, and `node_modules`.
- The `.gitignore` excludes `node_modules` and local environment files.
- The `/health` endpoint exposes no sensitive information.
- Input validation on `annualIncome` prevents injection via the API.
- All API responses use JSON with correct Content-Type headers.

---

## 18. Evidence Checklist

| Evidence                      | File                                       | Status             |
| ----------------------------- | ------------------------------------------ | ------------------ |
| 7 Jasmine specs passing       | `evidence/01-jasmine-tests-passing.txt`    | ✅                 |
| Docker image built            | `evidence/02-docker-build.txt`             | ✅                 |
| Container running + health OK | `evidence/03-docker-container-running.txt` | ✅                 |
| IBM CR image pushed           | `evidence/04-ibm-container-registry.txt`   | 🔄 Pending         |
| IBM Cloud deployment          | `evidence/05-ibm-cloud-deployment.txt`     | 🔄 Pending         |
| Tekton tasks applied          | `evidence/06-tekton-tasks.txt`             | 🔄 Pending cluster |
| Tekton pipeline applied       | `evidence/07-tekton-pipeline.txt`          | 🔄 Pending cluster |
| PipelineRun succeeded         | `evidence/08-tekton-pipelinerun.txt`       | 🔄 Pending cluster |

---

## 19. Known Limitations

1. **Illustrative tax brackets** — `TAX_BRACKETS` in `src/tax.js` are not official tax rates. Replace with the assignment-specified formula before submission.
2. **IBM Cloud CLI not installed on this machine** — Cloud tasks (Tasks 5–8) require manual execution after IBM Cloud CLI setup.
3. **Tekton cluster not available locally** — Pipeline tasks are validated YAML but require a Tekton-enabled Kubernetes cluster for execution.
4. **Google Fonts** — The UI references Google Fonts for Inter font; an internet connection is required at browser load time. The fallback chain (`ui-sans-serif, system-ui, Arial`) ensures the UI functions without it.
5. **Windows curl.exe quoting** — On Windows, use PowerShell `Invoke-RestMethod` for POST requests instead of `curl.exe` to avoid shell escaping issues.
