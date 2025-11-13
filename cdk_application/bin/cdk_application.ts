#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import * as stack from '../lib/cdk_application-stack';

const app = new cdk.App()
const batchStack = new stack.CdkApplicationStack(app, 'NextflowS3MultiPartError', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

cdk.Tags.of(batchStack).add('Stack', 'NextflowS3MultiPartError');
