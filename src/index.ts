import { App } from "@aws-cdk/core";
import createPipelineUsingPipelines from './pipelines';
import createPipelineUsingAwsCodepipeline from './aws-codepipeline';

const app = new App();

createPipelineUsingPipelines(app);
createPipelineUsingAwsCodepipeline(app);
