# Nextflow S3 multipart upload example

An example to replicate an error in Nextflow when staging foreign files to S3 via multipart upload.

## Error description

When running Nextflow 25.10.0 where a foreign file is staged into AWS S3 with multipart upload, the following error message is consistently encountered:

```text
Nov-12 00:45:25.196 [FileTransfer-4] DEBUG nextflow.file.FilePorter - Stage foreign file exception: recoverable=true; type=java.io.IOException; message=Failed to complete Amazon S3 multipart upload
Nov-12 00:45:25.197 [FileTransfer-4] WARN  nextflow.file.FilePorter - Unable to stage foreign file: https://pub-349bcb8decb44bf7acbddf90b270a061.r2.dev/HCC1395-SRA/25.0/data/wgts/fastq/HCC1395__tumour_wgs__WGS_IL_T_1__SRR7890856__subsampled__split_1.1.fastq.gz (try 1 of 3) -- Cause: Failed to complete Amazon S3 multipart upload
java.io.IOException: Failed to complete Amazon S3 multipart upload
        at nextflow.cloud.aws.nio.S3OutputStream.completeMultipartUpload(S3OutputStream.java:563)
        at nextflow.cloud.aws.nio.S3OutputStream.close(S3OutputStream.java:399)
        at java.base/java.nio.file.Files.copy(Files.java:3176)
        at nextflow.file.CopyMoveHelper.copyFile(CopyMoveHelper.java:95)
        at nextflow.file.CopyMoveHelper.copyToForeignTarget(CopyMoveHelper.java:178)
        at nextflow.file.FileHelper.copyPath(FileHelper.groovy:1014)
        at nextflow.file.FilePorter$FileTransfer.stageForeignFile0(FilePorter.groovy:373)
        at nextflow.file.FilePorter$FileTransfer.stageForeignFile(FilePorter.groovy:328)
        at nextflow.file.FilePorter$FileTransfer.run(FilePorter.groovy:300)
        at java.base/java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:572)
        at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:317)
        at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144)
        at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642)
        at java.base/java.lang.Thread.run(Thread.java:1575)
Caused by: software.amazon.awssdk.services.s3.model.S3Exception: The list of parts was not in ascending order. Parts must be ordered by part number. (Service: S3, Status Code: 200, Request ID: T0ZKFEQK3DJD36M3, Extended Request ID: 6pcoMOSvREVWnK+eAEHOekQAuoaL6k6tsksegk7sxeoUeJhSuQXq4JDy0pRAlWJvtQ8WVHCuUiGtVggs1yDeJPGT/qIxM6b3oWwZY3O+ndc=) (SDK Attempt Count: 1)
        at software.amazon.awssdk.services.s3.model.S3Exception$BuilderImpl.build(S3Exception.java:113)
        at software.amazon.awssdk.services.s3.model.S3Exception$BuilderImpl.build(S3Exception.java:61)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.utils.RetryableStageHelper.retryPolicyDisallowedRetryException(RetryableStageHelper.java:168)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.RetryableStage.execute(RetryableStage.java:73)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.RetryableStage.execute(RetryableStage.java:36)
        at software.amazon.awssdk.core.internal.http.pipeline.RequestPipelineBuilder$ComposingRequestPipelineStage.execute(RequestPipelineBuilder.java:206)
        at software.amazon.awssdk.core.internal.http.StreamManagingStage.execute(StreamManagingStage.java:53)
        at software.amazon.awssdk.core.internal.http.StreamManagingStage.execute(StreamManagingStage.java:35)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.ApiCallTimeoutTrackingStage.executeWithTimer(ApiCallTimeoutTrackingStage.java:82)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.ApiCallTimeoutTrackingStage.execute(ApiCallTimeoutTrackingStage.java:62)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.ApiCallTimeoutTrackingStage.execute(ApiCallTimeoutTrackingStage.java:43)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.ApiCallMetricCollectionStage.execute(ApiCallMetricCollectionStage.java:50)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.ApiCallMetricCollectionStage.execute(ApiCallMetricCollectionStage.java:32)
        at software.amazon.awssdk.core.internal.http.pipeline.RequestPipelineBuilder$ComposingRequestPipelineStage.execute(RequestPipelineBuilder.java:206)
        at software.amazon.awssdk.core.internal.http.pipeline.RequestPipelineBuilder$ComposingRequestPipelineStage.execute(RequestPipelineBuilder.java:206)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.ExecutionFailureExceptionReportingStage.execute(ExecutionFailureExceptionReportingStage.java:37)
        at software.amazon.awssdk.core.internal.http.pipeline.stages.ExecutionFailureExceptionReportingStage.execute(ExecutionFailureExceptionReportingStage.java:26)
        at software.amazon.awssdk.core.internal.http.AmazonSyncHttpClient$RequestExecutionBuilderImpl.execute(AmazonSyncHttpClient.java:210)
        at software.amazon.awssdk.core.internal.handler.BaseSyncClientHandler.invoke(BaseSyncClientHandler.java:103)
        at software.amazon.awssdk.core.internal.handler.BaseSyncClientHandler.doExecute(BaseSyncClientHandler.java:173)
        at software.amazon.awssdk.core.internal.handler.BaseSyncClientHandler.lambda$execute$1(BaseSyncClientHandler.java:80)
        at software.amazon.awssdk.core.internal.handler.BaseSyncClientHandler.measureApiCallSuccess(BaseSyncClientHandler.java:182)
        at software.amazon.awssdk.core.internal.handler.BaseSyncClientHandler.execute(BaseSyncClientHandler.java:74)
        at software.amazon.awssdk.core.client.handler.SdkSyncClientHandler.execute(SdkSyncClientHandler.java:45)
        at software.amazon.awssdk.awscore.client.handler.AwsSyncClientHandler.execute(AwsSyncClientHandler.java:53)
        at software.amazon.awssdk.services.s3.DefaultS3Client.completeMultipartUpload(DefaultS3Client.java:801)
        at software.amazon.awssdk.services.s3.DelegatingS3Client.lambda$completeMultipartUpload$1(DelegatingS3Client.java:611)
        at software.amazon.awssdk.services.s3.internal.crossregion.S3CrossRegionSyncClient.invokeOperation(S3CrossRegionSyncClient.java:67)
        at software.amazon.awssdk.services.s3.DelegatingS3Client.completeMultipartUpload(DelegatingS3Client.java:611)
        at nextflow.cloud.aws.nio.S3OutputStream.completeMultipartUpload(S3OutputStream.java:556)
        ... 13 common frames omitted
```

This eventually causes the pipeline run to fail after Nextflow attempts to stage the file(s) three times

Notably this does not occur when running the exact same analysis with Nextflow 25.04.6 via `NXF_VER=25.04.6 nextflow run ...`

## Requirements

The following are needed before proceeding:

- assumes VPC, EC2 SG, and S3 Bucket exists
  - see `cdk_application/lib/settings.ts` and `nextflow_pipeline/nextflow.config`
- adjust the instance role in `nextflow_pipeline/nextflow.config`
- set AWS credentials in corresponding environment variables


## Prepare

Deploy stack

```bash
(cd cdk_application/ && cdk deploy)
```

Spin up a `r6in.large` EC2 instance with the `nextflow-s3-multipart-upload-error-batch-instance-role--pipeline` IAM role and provision Nextflow software

## Run example

> The below is done on the EC2 instance manually spun up in the previous section and from the `nextflow_pipeline/` directory with appropriate settings applied

### Replicate

```bash
NXF_VER=25.10.0 nextflow run main.nf 2>&1 \
  -ansi-log false \
  --monochrome_logs \
  -work-dir s3://umccr-temp-dev/stephen/nextflow-s3-multipart-upload-error/replicate/ | tee log.replicate.txt
```

### Downgrade to avoid error

```bash
NXF_VER=25.04.6 nextflow run main.nf 2>&1 \
  -ansi-log false \
  --monochrome_logs \
  -work-dir s3://umccr-temp-dev/stephen/nextflow-s3-multipart-upload-error/downgrade/ | tee log.downgrade.txt
```
