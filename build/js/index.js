"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aws_lambda_1 = require("@aws-cdk/aws-lambda");
var core_1 = require("@aws-cdk/core");
var pipelines_1 = require("@aws-cdk/pipelines");
var aws_lambda_2 = require("@aws-cdk/aws-lambda");
var app = new core_1.App();
var stack = new core_1.Stack(app, "MyStack");
var pipeline = new pipelines_1.CodePipeline(stack, "Pipeline", {
    pipelineName: "MyPipeline",
    selfMutation: false,
    synth: new pipelines_1.ShellStep('Synth', {
        input: pipelines_1.CodePipelineSource.gitHub('ryparker/aws-cdk-sample-pipeline', 'main'),
        commands: [
            'yarn install',
            'yarn build'
        ],
        primaryOutputDirectory: 'build/cloudformation',
    }),
});
var wave = pipeline.addWave('CustomWave', {
    pre: [new pipelines_1.ManualApprovalStep('ManualApproval')],
    post: [
        new pipelines_1.CodeBuildStep('CustomWaveAction', {
            projectName: 'CustomWaveActionBuild',
            commands: [
                'echo Hello World'
            ],
        })
    ],
});
var lambdaStage = new core_1.Stage(stack, 'LambdaWaveStage');
var lambdaStageStack = new core_1.Stack(lambdaStage, 'LambdaWaveStack');
new aws_lambda_2.Function(lambdaStageStack, 'MyFunction', {
    code: aws_lambda_2.Code.fromInline('console.log("hello world");'),
    runtime: aws_lambda_1.Runtime.NODEJS_14_X,
    handler: 'index.handler',
});
wave.addStage(lambdaStage);
