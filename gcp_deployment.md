# GCP Deployment Guide for RAG System

Next.js variables prefixed with `NEXT_PUBLIC_` are evaluated at **build time**, not runtime. This means that if you only pass it as a runtime environment variable in Docker, the browser won't see it. The correct approach is to pass it as an `ARG` during the Docker build process, which we have now updated in your `Dockerfile` and `docker-compose.yml`.

Here is the recommended architecture and flow for deploying this system on **Google Cloud Platform (GCP)**.

## Architecture Overview

For a modern containerized application like yours, **Google Cloud Run** is the best choice for running your Frontend and Backend, and **Cloud SQL** / **Compute Engine** for your databases.

1.  **Frontend (Next.js)**: Deployed to Google Cloud Run (Serverless, scales to 0, highly available).
2.  **Backend (Node.js)**: Deployed to Google Cloud Run (Serverless, handles API requests).
3.  **Database (PostgreSQL)**: Deployed to Google Cloud SQL for PostgreSQL (Managed database).
4.  **Vector DB (ChromaDB)**: Deployed to a small Compute Engine (GCE) instance, because ChromaDB requires persistent disk storage which is complex to manage efficiently on fully serverless setups like Cloud Run.

---

## Deployment Steps

### Step 1: Prepare GCP Environment
1. Install the [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install).
2. Authenticate: `gcloud auth login`
3. Set your project: `gcloud config set project [YOUR_PROJECT_ID]`
4. Enable required APIs:
   ```bash
   gcloud services enable run.googleapis.com \
       artifactregistry.googleapis.com \
       sqladmin.googleapis.com \
       compute.googleapis.com
   ```

### Step 2: Set up the Databases
**PostgreSQL**:
Create a Cloud SQL instance and a database (`rag_db`). Keep note of the connection string.

**ChromaDB**:
Deploy ChromaDB to a cheap Compute Engine VM. 
1. Create a VM.
2. SSH into it, install Docker.
3. Run ChromaDB: `docker run -d -p 8000:8000 -v chroma-data:/chroma/chroma -e IS_PERSISTENT=TRUE chromadb/chroma:latest`
4. Keep note of the internal/external IP.

### Step 3: Build and Push Docker Images
Create an Artifact Registry repository to store your Docker images:
```bash
gcloud artifacts repositories create rag-repo \
    --repository-format=docker \
    --location=us-central1
```

**Build Backend:**
```bash
cd backend
gcloud builds submit --tag us-central1-docker.pkg.dev/[PROJECT_ID]/rag-repo/backend .
```

**Build Frontend (Passing the Build Arg!!!):**
Here is where you solve the Next.js build-time issue. You must pass the backend's URL as an argument at build time. 

```bash
cd frontend
gcloud builds submit --tag us-central1-docker.pkg.dev/[PROJECT_ID]/rag-repo/frontend \
    --build-arg NEXT_PUBLIC_API_URL="https://[YOUR_BACKEND_CLOUD_RUN_URL]/api" .
```

### Step 4: Deploy to Cloud Run

**Deploy Backend:**
```bash
gcloud run deploy rag-backend \
    --image us-central1-docker.pkg.dev/[PROJECT_ID]/rag-repo/backend \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars CHROMA_URL="http://[CHROMA_VM_IP]:8000",DB_URL="postgresql://user:password@[CLOUD_SQL_IP]:5432/rag_db",JWT_SECRET="your-secret"
```

**Deploy Frontend:**
```bash
gcloud run deploy rag-frontend \
    --image us-central1-docker.pkg.dev/[PROJECT_ID]/rag-repo/frontend \
    --region us-central1 \
    --allow-unauthenticated
```

*(Note: Since you already baked `NEXT_PUBLIC_API_URL` into the frontend image during `gcloud builds`, you do not need to pass it as a `--set-env-vars` here for the browser to see it. It is already in the static JS!)*
