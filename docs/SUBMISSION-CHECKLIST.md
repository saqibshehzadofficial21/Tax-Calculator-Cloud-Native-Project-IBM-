# Submission Checklist — Cloud-Native Tax Calculator

> **Introduction to Cloud Native — Final Project**

---

## Part A — Project Management

| # | Requirement | Implementation File | Verification | Status |
|---|---|---|---|---|
| A-01 | Create an Epic | `docs/PROJECT-MANAGEMENT.md` | Read Epic section | ✅ Complete |
| A-02 | Create detailed user stories (min. 8) | `docs/PROJECT-MANAGEMENT.md` | US-01 through US-08 | ✅ Complete |
| A-03 | Define acceptance criteria per story | `docs/PROJECT-MANAGEMENT.md` | Each US has AC table | ✅ Complete |
| A-04 | Organise implementation tasks | `docs/PROJECT-MANAGEMENT.md` | Task Breakdown table | ✅ Complete |

---

## Part B — Application Testing and Containerisation

| # | Requirement | Implementation File | Verification Command | Actual Result | Evidence | Status |
|---|---|---|---|---|---|---|
| B-01 | 7 passing Jasmine specs, 0 failures | `spec/tax.spec.js` | `npx jasmine` | `7 specs, 0 failures` | `evidence/01-jasmine-tests-passing.txt` | ✅ Complete |
| B-02 | Valid Dockerfile | `Dockerfile` | `docker build -t tax-calculator:latest .` | Image built successfully | `evidence/02-docker-build.txt` | ✅ Complete |
| B-03 | Docker image built locally | `Dockerfile` | `docker images tax-calculator` | Image 0403cbfa55d1 (199MB) | `evidence/02-docker-build.txt` | ✅ Complete |
| B-04 | Container runs and serves app | — | `docker ps` + `curl /health` | Container Up (healthy), HTTP 200 | `evidence/03-docker-container-running.txt` | ✅ Complete |
| B-05 | API returns correct results | `src/server.js` | `POST /api/tax/calculate` | `{"annualTax":60000}` | `evidence/03-docker-container-running.txt` | ✅ Complete |
| B-06 | Tag and push to IBM Cloud CR | — | `ibmcloud cr images` | Pending IBM Cloud CLI install | `evidence/04-ibm-container-registry.txt` | 🔄 Pending |
| B-07 | Deploy to IBM Cloud | `k8s/deployment.yaml` | `kubectl rollout status` | Pending IKS cluster access | `evidence/05-ibm-cloud-deployment.txt` | 🔄 Pending |

---

## Part C — Tekton CI/CD

| # | Requirement | Implementation File | Verification Command | Actual Result | Evidence | Status |
|---|---|---|---|---|---|---|
| C-01 | Tekton test Task | `tekton/tasks/test.yaml` | `tkn task list` | File exists, valid YAML | `evidence/06-tekton-tasks.txt` | ✅ Implemented |
| C-02 | Tekton build/push Task | `tekton/tasks/build-push.yaml` | `tkn task list` | File exists, valid YAML | `evidence/06-tekton-tasks.txt` | ✅ Implemented |
| C-03 | Tekton deploy Task | `tekton/tasks/deploy.yaml` | `tkn task list` | File exists, valid YAML | `evidence/06-tekton-tasks.txt` | ✅ Implemented |
| C-04 | Tekton Pipeline connecting tasks | `tekton/pipeline.yaml` | `tkn pipeline list` | File exists, valid YAML | `evidence/07-tekton-pipeline.txt` | ✅ Implemented |
| C-05 | Pipeline enforces test → build → deploy | `tekton/pipeline.yaml` | `runAfter` fields | Correctly configured | `evidence/07-tekton-pipeline.txt` | ✅ Implemented |
| C-06 | PipelineRun template | `tekton/pipelinerun.yaml` | `kubectl apply -f` | Template ready | `evidence/08-tekton-pipelinerun.txt` | ✅ Implemented |
| C-07 | PipelineRun execution | `tekton/pipelinerun.yaml` | `tkn pipelinerun logs --last -f` | Pending cluster | `evidence/08-tekton-pipelinerun.txt` | 🔄 Pending |
| C-08 | Deploy uses pipeline-built image | `tekton/pipeline.yaml` | Image tag consistency | `$(params.image):$(params.tag)` | `evidence/08-tekton-pipelinerun.txt` | ✅ Implemented |

---

## Summary

| Category | Complete | Pending / Blocked | Total |
|---|---|---|---|
| Part A — Project Management | 4 | 0 | 4 |
| Part B — Testing & Docker | 5 | 2 | 7 |
| Part C — Tekton CI/CD | 7 | 1 | 8 |
| **Total** | **16** | **3** | **19** |

---

## Remaining Actions (Manual — Require IBM Cloud Access)

### Action 1: Install IBM Cloud CLI and push image

```bash
# 1. Install IBM Cloud CLI from:
#    https://cloud.ibm.com/docs/cli?topic=cli-install-ibmcloud-cli

# 2. Authenticate
ibmcloud login --sso
ibmcloud target -r us-south
ibmcloud plugin install container-registry -f
ibmcloud cr region-set us-south

# 3. Check / create namespace
ibmcloud cr namespace-list
# ibmcloud cr namespace-add YOUR_NAMESPACE

# 4. Push image
ibmcloud cr login
docker tag tax-calculator:latest us.icr.io/YOUR_NAMESPACE/tax-calculator:v1
docker push us.icr.io/YOUR_NAMESPACE/tax-calculator:v1
ibmcloud cr images

# 5. Update evidence/04-ibm-container-registry.txt with actual output
```

### Action 2: Deploy to IBM Cloud Kubernetes Service

```bash
# 1. Create or access IKS cluster in IBM Cloud Console

# 2. Retrieve kubeconfig
ibmcloud ks cluster config --cluster YOUR_CLUSTER_NAME

# 3. Deploy
export IMAGE=us.icr.io/YOUR_NAMESPACE/tax-calculator:v1
sed "s|IMAGE_PLACEHOLDER|$IMAGE|g" k8s/deployment.yaml | kubectl apply -f -
kubectl rollout status deployment/tax-calculator

# 4. Update evidence/05-ibm-cloud-deployment.txt with actual output
```

### Action 3: Execute Tekton PipelineRun

```bash
# 1. Ensure cluster has Tekton Pipelines installed
# 2. Apply all resources
kubectl apply -f tekton/config/workspace-pvc.yaml
kubectl apply -f tekton/config/rbac.yaml
kubectl apply -f tekton/tasks/test.yaml
kubectl apply -f tekton/tasks/build-push.yaml
kubectl apply -f tekton/tasks/deploy.yaml
kubectl apply -f tekton/pipeline.yaml

# 3. Create registry secret (never commit the key)
kubectl create secret docker-registry ibm-registry-auth \
  --docker-server=us.icr.io \
  --docker-username=iamapikey \
  --docker-password="$IBM_CLOUD_API_KEY" \
  --docker-email=unused@example.com

# 4. Submit PipelineRun (after editing pipelinerun.yaml)
kubectl apply -f tekton/pipelinerun.yaml
tkn pipelinerun logs --last -f

# 5. Update evidence/06, 07, 08 with actual tkn and kubectl output
```

---

> **Important:** All evidence files for cloud tasks (04–08) must be updated with actual terminal output after execution. Do not submit placeholder text as proof.
