import { Runtime } from '@aws-cdk/aws-lambda';
import { Construct, Stack, Stage } from "@aws-cdk/core";
import { CodePipeline, ShellStep, CodePipelineSource, ManualApprovalStep, CodeBuildStep } from "@aws-cdk/pipelines";
import { Function, Code } from '@aws-cdk/aws-lambda';

/**
 * Create a stack that implements a Pipeline using `@aws-cdk/pipelines`
 */
export default (scope: Construct) => {
  const stack = new Stack(scope, "PipelinesStack");

  const pipeline = new CodePipeline(stack, "Pipeline-Using-Pipelines", {
    pipelineName: "MyPipeline",
    selfMutation: false,
    synth: new ShellStep('Synth', {
      input: CodePipelineSource.gitHub('ryparker/aws-cdk-sample-pipeline', 'main'),
      commands: [
        'yarn install',
        'yarn build'
      ],
      primaryOutputDirectory: 'build/cloudformation',
    }),
  });

  const wave = pipeline.addWave('LambdaWave', {
    pre: [new ManualApprovalStep('ManualApproval')],
    post: [
      new CodeBuildStep('CustomWaveAction', {
        projectName: 'CustomWaveActionBuild',
        commands: [
          'echo Hello World'
        ],
      })],
  });

  const lambdaStage = new Stage(stack, 'LambdaStage');
  const lambdaStack = new Stack(lambdaStage, 'lambdaStack');
  new Function(lambdaStack, 'MyFunction', {
    code: Code.fromInline('console.log("hello world");'),
    runtime: Runtime.NODEJS_14_X,
    handler: 'index.handler',
  });
  wave.addStage(lambdaStage);
};
