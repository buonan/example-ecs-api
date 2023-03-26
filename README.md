# How to tag image for AWS ECR
- build image
```
$ cd api
$ npm run build
```
# How to create AWS ECR repository
- login aws ecr
```
$ aws --profile hurricane ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin [aws-account].dkr.ecr.us-west-1.amazonaws.com
```
- create ecr repository
```
$ aws --profile hurricane ecr create-repository \
  --repository-name example-api \
  --region us-west-1 \
  --query 'repository.repositoryUri' \
  --output text
```
# How to tag and upload
```
$ docker tag fce3b3c01ec9 [aws-account].dkr.ecr.us-west-1.amazonaws.com/example-api:api
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
  up --scale api=5
```
# How to teardown ECS Cluster
```
$ docker compose \
  --project-name example-api \
  --file docker-compose-ecs.yml \
  down
```