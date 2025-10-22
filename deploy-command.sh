#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Deploy with substitution variables
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}",_NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}",_CLERK_SECRET_KEY="${CLERK_SECRET_KEY}"
