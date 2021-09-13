import { Construct, Stack, SecretValue } from "@aws-cdk/core";
import { CdkPipeline, ShellScriptAction } from "@aws-cdk/pipelines";
import { PipelineProject, BuildSpec } from '@aws-cdk/aws-codebuild';
import { ManualApprovalAction, GitHubSourceAction, CodeBuildAction } from '@aws-cdk/aws-codepipeline-actions';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { PolicyStatement, Effect } from '@aws-cdk/aws-iam';

/**
 * Create a stack that implements a `CdkPipeline` using `@aws-cdk/pipelines`
 */
export default (scope: Construct) => {
  const stack = new Stack(scope, "CdkPipelineStack");

  const cloudAssemblyArtifact = new Artifact('cloudAssemblyArtifact');
  const sourceArtifact = new Artifact('SourceCode');


  const pipeline = new CdkPipeline(stack, "CdkPipeline", {
    pipelineName: "CdkPipeline-Using-Pipelines",
    selfMutating: true,
    cloudAssemblyArtifact: cloudAssemblyArtifact,
    sourceAction: new GitHubSourceAction({
      actionName: 'GitHub',
      oauthToken: SecretValue.secretsManager('github-token'),
      owner: 'ryparker',
      repo: 'aws-cdk-sample-pipeline',
      branch: 'main',
      output: sourceArtifact,
      runOrder: 1,
    }),
    synthAction: new ShellScriptAction({
      actionName: 'Deploy',
      additionalArtifacts: [sourceArtifact],
      commands: [
        'yarn install',
        'yarn run tsc',
        'yarn run cdk synth',
        'yarn run cdk deploy CdkPipeline --require-approval never',
      ],
      rolePolicyStatements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['*'],
          resources: ['*'],
        }),
      ],
      runOrder: 1,
    }),
  });

  const assetsStage = pipeline.addStage('Assets');
  assetsStage.addActions(
    new CodeBuildAction({
      actionName: 'DockerBuildAndUploadToEcr',
      project: new PipelineProject(stack, 'DockerBuildAndUploadToEcr', {
        buildSpec: BuildSpec.fromSourceFilename('images/buildspec.yml')
      }),
      input: sourceArtifact,
    })
  );

  const securityStage = pipeline.addStage('Security');
  securityStage.addActions(
    new ManualApprovalAction({
      actionName: 'Approve',
      runOrder: 1,
    }),
  );

  // const wave = pipeline.addStage('LambdaWave', {
  //   pre: [new ManualApprovalStep('ManualApproval')],
  //   post: [
  //     new CodeBuildStep('CustomWaveAction', {
  //       projectName: 'CustomWaveActionBuild',
  //       commands: [
  //         'echo Hello World'
  //       ],
  //     })],
  // });

  // const lambdaStage = new Stage(stack, 'LambdaStage');
  // const lambdaStack = new Stack(lambdaStage, 'lambdaStack');
  // new Function(lambdaStack, 'MyFunction', {
  //   code: Code.fromInline('console.log("hello world");'),
  //   runtime: Runtime.NODEJS_14_X,
  //   handler: 'index.handler',
  // });
  // wave.addStage(lambdaStage);
};
