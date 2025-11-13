import { Construct } from 'constructs'

import * as batch from 'aws-cdk-lib/aws-batch';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';

import * as settings from './settings';

export class CdkApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);




    // Collect existing resources
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcName: settings.VPC_NAME,
    });

    const securityGroup = ec2.SecurityGroup.fromLookupByName(
      this,
      'SecurityGroup',
      settings.EC2_SG_NAME,
      vpc,
    );




    // Create Batch resources
    const roleBatchInstanceTask = new iam.Role(this, 'BatchInstanceRole', {
      roleName: 'nextflow-s3-multipart-upload-error-batch-instance-role--task',
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('ec2.amazonaws.com'),
        new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role'),
      ],
    });

    const blockDevice: ec2.BlockDevice = {
      deviceName: '/dev/xvda',
      volume: ec2.BlockDeviceVolume.ebs(50, {
        volumeType: ec2.EbsDeviceVolumeType.GP3,
        throughput: 200,
        iops: 6000,
      }),
    };

    const launchTemplate = new ec2.LaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateName: 'nextflow-s3-multipart-upload-error',
      associatePublicIpAddress: true,
      userData: ec2.UserData.custom(settings.launchTemplateUserDataString),
      blockDevices: [blockDevice],
      httpTokens: ec2.LaunchTemplateHttpTokens.REQUIRED,
      requireImdsv2: true,
      securityGroup: securityGroup,
    });

    cdk.Tags.of(launchTemplate).add('Name', 'nextflow-s3-multipart-upload-error');

    const computeEnvironment = new batch.ManagedEc2EcsComputeEnvironment(this, 'ComputeEnvironment', {
      allocationStrategy: batch.AllocationStrategy.BEST_FIT,
      instanceRole: roleBatchInstanceTask,
      instanceTypes: [new ec2.InstanceType('r6in.large')],
      launchTemplate: launchTemplate,
      maxvCpus: 256,
      securityGroups: [],
      useOptimalInstanceClasses: false,
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    const jobQueue = new batch.JobQueue(this, 'JobQueue', {
      jobQueueName: 'nextflow-s3-multipart-upload-error',
      computeEnvironments: [
        { computeEnvironment: computeEnvironment, order: 1 },
      ],
    });




    // Create instance role for pipeline
    const roleBatchInstancePipeline = new iam.Role(this, 'PipelineBatchInstanceRole', {
      roleName: 'nextflow-s3-multipart-upload-error-batch-instance-role--pipeline',
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('ec2.amazonaws.com'),
        new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role'),
      ],
    });

    new iam.Policy(this, 'PipelinePolicyBatchJobs', {
      roles: [roleBatchInstancePipeline],
      statements: [new iam.PolicyStatement({
        actions: [
          'batch:CancelJob',
          'batch:SubmitJob',
          'batch:TagResource',
          'batch:TerminateJob',
        ],
        resources: [
          jobQueue.jobQueueArn,
          `arn:aws:batch:${this.region}:${this.account}:job-definition/nf-*`,
        ],
      })],
    });

    new iam.Policy(this, 'PipelinePolicyBatchGeneral', {
      roles: [roleBatchInstancePipeline],
      statements: [new iam.PolicyStatement({
        actions: [
          'batch:ListJobs',
          'batch:DescribeJobs',
          'batch:DescribeJobQueues',
          'batch:DescribeComputeEnvironments',
          'batch:RegisterJobDefinition',
          'batch:DescribeJobDefinitions',
        ],
        resources: ['*'],
      })],
    });

    new iam.Policy(this, 'PipelinePolicyInstances', {
      roles: [roleBatchInstancePipeline],
      statements: [new iam.PolicyStatement({
        actions: [
          'ecs:DescribeTasks',
          'ec2:DescribeInstances',
          'ec2:DescribeInstanceTypes',
          'ec2:DescribeInstanceAttribute',
          'ecs:DescribeContainerInstances',
          'ec2:DescribeInstanceStatus',
        ],
        resources: ['*'],
      })],
    });

    new iam.Policy(this, 'CloudWatchLogEvents', {
      roles: [roleBatchInstancePipeline],
      statements: [new iam.PolicyStatement({
        actions: [
          'logs:GetLogEvents',
        ],
        resources: [
          `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/batch/job/:nf-*`
        ],
      })],
    });

    new iam.InstanceProfile(this, 'PipelineBatchInstanceProfile', {
      role: roleBatchInstancePipeline,
    });

    roleBatchInstancePipeline.attachInlinePolicy(
      new iam.Policy(this, 'PipelinePolicyPassRole', {
        statements: [
          new iam.PolicyStatement({
            actions: ['iam:PassRole'],
            resources: [roleBatchInstanceTask.roleArn],
          })
        ],
      })
    );




    // Bucket permissions
    const nfBucket = s3.Bucket.fromBucketName(this, 'S3Bucket',
      settings.S3_BUCKET_NAME,
    );

    nfBucket.grantReadWrite(roleBatchInstancePipeline);
    nfBucket.grantReadWrite(roleBatchInstanceTask);

  }
}

