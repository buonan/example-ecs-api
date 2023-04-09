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
$ time docker compose \
  --project-name example-api \
  --file docker-compose-ecs.yml \
  up

real    12m43.239s
user    0m18.279s
sys     0m9.823s
```
# How Debug container exited
```
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
# How to SSH Tunnel to services
```
ssh -i "hurricane-ec2.pem" -L 9999:172.31.14.167:9000 ec2-user@ec2-13-57-17-49.us-west-1.compute.amazonaws.com
http://localhost:9999 -> instance:80
```
# How to update service new image
```
aws --profile hurricane ecs update-service --cluster example-api --service arn:aws:ecs:us-west-1:[aws-account]:service/example-api/example-api-WorkerService-l0iJ5ggCz2L9 --force-new-deployment
-or-
docker compose \
  --project-name example-api \
  --file docker-compose-ecs.yml \
  up --scale worker=2
```
# How to teardown ECS Cluster
```
$ time docker compose \
  --project-name example-api \
  --file docker-compose-ecs.yml \
  down

real    14m34.079s
user    0m21.455s
sys     0m5.806s
```

# Clean up volumes
```
$ aws --profile hurricane efs describe-file-systems | jq -r '.FileSystems | .[] | select(.Name=="example-api_mongo_db").FileSystemId'
$ aws --profile hurricane efs delete-file-system --file-system-id fs-07784c20162abc134
```

# Troubleshooting
- cannot be deleted while in status UPDATE_IN_PROGRESS
see https://repost.aws/knowledge-center/ecs-service-stuck-update-status
see https://repost.aws/knowledge-center/cloudformation-stack-delete-failed

# Helpful command
- docker ps --all --format '{{.Names}}'
- docker volume ls | grep example | awk '{print $2}' | xargs docker volume rm $1
- docker images | grep example | awk '{print $3}' | xargs docker rmi -f $1

 # Better supports kafka 2.0.4
image: hlebalbau/kafka-manager:latest
0.9.0.1
# Older and doesn't show consumers
image: sheepkiller/kafka-manager:latest
0.9.0.1