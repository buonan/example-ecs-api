# How to build image
- build
```
$ cd api
$ docker context use default
$ npm run build
$ npm run image
```
# How to create AWS ECR repository
- create ecr repository
```
$ aws --profile hurricane ecr create-repository \
  --repository-name example-api \
  --region us-west-1 \
  --query 'repository.repositoryUri' \
  --output text
```
- login aws ecr
```
$ aws --profile hurricane ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin [aws-account].dkr.ecr.us-west-1.amazonaws.com
```
# How to tag and upload
```
$ docker tag 8e3428053fc4 [aws-account].dkr.ecr.us-west-1.amazonaws.com/example-api:api
$ docker image push [aws-account].dkr.ecr.us-west-1.amazonaws.com/example-api:api
```
# How to create ECS Cluster with Docker Compose
- create/use docker ECS context
```
$ docker context create ecs example_ecs_context
$ docker context use example_ecs_context
```
# Deploy the Docker Compose File
```
$ docker compose \
  --project-name example-api \
  --file docker-compose-ecs.yml \
  up
```
# How check and curl endpoint:port
```
$ aws --profile hurricane elbv2 describe-load-balancers | jq -r '.LoadBalancers | .[] | select(.DNSName|test("exam.")).DNSName'
```
# How to Scale Service
```
$ docker compose \
  --project-name example-api \
  --file docker-compose-ecs.yml \
  up --scale api=2
```
# How to update service new image
```
aws --profile hurricane ecs update-service --cluster example-api --service arn:aws:ecs:us-west-1:[aws-account]:service/example-api/example-api-ApiService-uRyeNbHc5O2F --force-new-deployment
-or-
docker compose \
  --project-name example-api \
  --file docker-compose-ecs.yml \
  up --scale api=2
```
# How to teardown ECS Cluster
```
$ docker compose \
  --project-name example-api \
  --file docker-compose-ecs.yml \
  down
```

# Clean up volumes
```
$ aws --profile hurricane efs describe-file-systems | jq -r '.FileSystems | .[] | select(.Name=="example-api_mongo_db").FileSystemId'

$ aws --profile hurricane efs delete-file-system \
   --file-system-id fs-07784c20162abc134
```

# Troubleshooting
- cannot be deleted while in status UPDATE_IN_PROGRESS
see https://repost.aws/knowledge-center/ecs-service-stuck-update-status