import { App, Stack } from "@aws-cdk/core";
import { CodePipeline, ShellStep, CodePipelineSource, ManualApprovalStep, CodeBuildStep } from "@aws-cdk/pipelines";

const app = new App();
const stack = new Stack(app, "MyStack");

const pipeline = new CodePipeline(stack, "Pipeline", {
  pipelineName: "MyPipeline",
  selfMutation: false,
  synth: new ShellStep('Synth', {
    input: CodePipelineSource.gitHub('ryparker/aws-cdk-sample-pipeline', 'main'),
    commands: [
      'yarn install',
    ],
    primaryOutputDirectory: 'build/cloudformation',
  }),
});

pipeline.addWave('CustomWave', {
  pre: [new ManualApprovalStep('ManualApproval')],
  post: [
    new CodeBuildStep('CustomWaveAction', {
      projectName: 'CustomWaveActionBuild',
      commands: [
        'echo Hello World'
      ],
    })],
});
