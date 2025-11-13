export const VPC_NAME = 'main-vpc';
export const EC2_SG_NAME = 'main-vpc-sg-outbound';

export const S3_BUCKET_NAME = 'umccr-temp-dev';

export const launchTemplateUserDataString = (`MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==BOUNDARY=="

--==BOUNDARY==
Content-Type: text/cloud-config; charset="us-ascii"

packages:
  - unzip

--==BOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
curl https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp/

/tmp/aws/install --install-dir /opt/awscliv2/aws-cli/ --bin-dir /opt/awscliv2/bin/
ln -s /opt/awscliv2/bin/aws /usr/local/bin/
--==BOUNDARY==--`);
