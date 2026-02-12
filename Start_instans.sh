#!/bin/bash

aws ec2 run-instances --image-id  ami-0bae57ee7c4478e01 --count 1 --instance-type t3.micro \
  --key-name web-key --associate-public-ip-address --security-group-ids  sg-0b41874db772259c2\
  --region eu-central-1 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ICHGRAMM-Project}]' \
  --user-data file://start_script.sh
