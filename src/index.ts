import { App } from "@aws-cdk/core";
import createCodePipelineUsingPipelines from './stacks/pipelines/code-pipeline';
import createPipelineUsingAwsCodepipeline from './stacks/aws-codepipeline/pipeline';
import createCdkPipelineUsingPipeline from './stacks/pipelines/cdk-pipeline';

const app = new App();

createCdkPipelineUsingPipeline(app);
createCodePipelineUsingPipelines(app);
createPipelineUsingAwsCodepipeline(app);
