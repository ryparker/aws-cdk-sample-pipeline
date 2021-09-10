import { Construct, Stack, SecretValue } from "@aws-cdk/core";
import { Pipeline, Artifact } from '@aws-cdk/aws-codepipeline';
import { PipelineProject } from '@aws-cdk/aws-codebuild';
import { ShellScriptAction } from '@aws-cdk/pipelines';
import { ManualApprovalAction, GitHubSourceAction, CodeBuildAction } from '@aws-cdk/aws-codepipeline-actions';
import { PolicyStatement, Effect } from '@aws-cdk/aws-iam';

/**
 * Create a stack that implements a Pipeline using `@aws-cdk/aws-codepipeline`
 */
export default (scope: Construct) => {
  const stack = new Stack(scope, "AwsCodepipelinesStack");

  const sourceArtifact = new Artifact('SourceCode');

  new Pipeline(stack, 'Pipeline', {
    pipelineName: 'Pipeline-Using-AwsCodepipelines',
    stages: [
      {
        stageName: 'Source',
        actions: [
          new GitHubSourceAction({
            actionName: 'GitHub',
            oauthToken: SecretValue.secretsManager('github-token'),
            owner: 'ryparker',
            repo: 'aws-cdk-sample-pipeline',
            branch: 'main',
            output: sourceArtifact,
            runOrder: 1,
          }),
        ],
      },
      {
        stageName: 'Deploy',
        actions: [
          new ShellScriptAction({
            actionName: 'Deploy',
            additionalArtifacts: [sourceArtifact],
            commands: [
              'yarn install',
              'yarn run tsc',
              'yarn run cdk synth',
              'yarn run cdk deploy --all'
            ],
            rolePolicyStatements: [
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['cloudformation:*'],
                resources: ['*'],
              })
            ],
            runOrder: 1,
          })
        ]
      },
      {
        stageName: 'Post-Deploy-Actions',
        actions: [
          new ManualApprovalAction({
            actionName: 'Approve',
            runOrder: 1,
          }),
          new CodeBuildAction({
            actionName: 'CustomCodeBuildAction',
            input: sourceArtifact,
            project: new PipelineProject(stack, 'CustomProject'),
            runOrder: 2,
          }),
        ]
      }
    ],
  });
}
