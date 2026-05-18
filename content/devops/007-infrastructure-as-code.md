---
title: Infrastructure as Code (IaC)
order: 7
---

Historically, infrastructure was provisioned manually. Sysadmins would click through AWS consoles or run imperative bash scripts to spin up servers, configure networks, and attach databases. This approach is slow, error-prone, untrackable, and impossible to replicate perfectly (the "Snowflake Server" problem).

Infrastructure as Code (IaC) solves this by treating your infrastructure configuration exactly like application code.

## 1. What is IaC?

IaC is the managing and provisioning of computer data centers through machine-readable definition files.

*   **Version Controlled:** Your infrastructure definitions live in Git. Every change requires a Pull Request, code review, and provides an audit log of who changed what, when, and why.
*   **Idempotent:** Running the IaC script once has the same effect as running it 100 times. It ensures the target environment matches the defined state.
*   **Reproducible:** Need a staging environment that perfectly mirrors production? You can spin one up in minutes by pointing your IaC scripts at a new AWS account.

## 2. Declarative vs. Imperative

*   **Imperative (Bash scripts, Ansible):** You write commands detailing *how* to achieve the desired state. (e.g., "Create an EC2 instance, then attach this security group, then start it").
*   **Declarative (Terraform, CloudFormation):** You describe the *desired end state*, and the IaC tool calculates the "diff" between reality and your code, applying only the necessary changes to reach that state. 

## 3. Terraform: The Industry Standard

HashiCorp Terraform is the dominant IaC tool because it is cloud-agnostic. While AWS CloudFormation only works for AWS, Terraform uses "Providers" to manage resources across AWS, GCP, Azure, GitHub, Cloudflare, and hundreds of other services using a single language (HCL).

### Example Terraform Configuration (HCL)

```hcl
# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

# Create a VPC
resource "aws_vpc" "main_network" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "production-vpc"
  }
}

# Create a highly available PostgreSQL Database
resource "aws_db_instance" "app_database" {
  engine         = "postgres"
  engine_version = "14.7"
  instance_class = "db.t3.medium"
  allocated_storage = 20
  db_name        = "app_prod"
  username       = "admin"
  password       = var.db_password # Pulled securely from variables/secrets
  multi_az       = true            # High availability across zones
}
```

## 4. Configuration Management (Ansible / Chef / Puppet)

While Terraform is brilliant at *provisioning* infrastructure (creating the EC2 instance), it is not designed to configure the internals of the operating system.

**Configuration Management** tools like Ansible are used *after* the server is created to install dependencies, update packages, and write configuration files. However, with the rise of immutable Docker containers (where the dependencies are baked into the image), the usage of tools like Ansible has plummeted in modern stacks.
