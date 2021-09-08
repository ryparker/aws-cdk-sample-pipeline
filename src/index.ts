import { Runtime } from '@aws-cdk/aws-lambda';
import { App, Stack, Stage } from "@aws-cdk/core";
import { CodePipeline, ShellStep, CodePipelineSource, ManualApprovalStep, CodeBuildStep } from "@aws-cdk/pipelines";
import { Function, Code } from '@aws-cdk/aws-lambda';

const app = new App();
const stack = new Stack(app, "MyStack");

const pipeline = new CodePipeline(stack, "Pipeline", {
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

const wave = pipeline.addWave('CustomWave', {
  pre: [new ManualApprovalStep('ManualApproval')],
  post: [
    new CodeBuildStep('CustomWaveAction', {
      projectName: 'CustomWaveActionBuild',
      commands: [
        'echo Hello World'
      ],
    })],
});

const lambdaStage = new Stage(stack, 'LambdaWaveStage');
const lambdaStageStack = new Stack(lambdaStage, 'LambdaWaveStack');
new Function(lambdaStageStack, 'MyFunction', {
  code: Code.fromInline('console.log("hello world");'),
  runtime: Runtime.NODEJS_14_X,
  handler: 'index.handler',
});
wave.addStage(lambdaStage);
