import { App } from "@aws-cdk/core";
import createPipelineUsingPipelines from './stacks/pipelines';
import createPipelineUsingAwsCodepipeline from './stacks/aws-codepipeline';

const app = new App();

createPipelineUsingPipelines(app);
createPipelineUsingAwsCodepipeline(app);
