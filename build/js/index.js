"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@aws-cdk/core");
var pipelines_1 = require("@aws-cdk/pipelines");
var app = new core_1.App();
var stack = new core_1.Stack(app, "MyStack");
var pipeline = new pipelines_1.CodePipeline(stack, "Pipeline", {
    pipelineName: "MyPipeline",
    synth: new pipelines_1.ShellStep('Synth', {
        input: pipelines_1.CodePipelineSource.gitHub('ryparker/aws-cdk-sample-pipeline', 'main'),
        commands: [
            'yarn install',
        ],
    }),
});
pipeline.addWave('CustomWave', {
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
