"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// eslint-disable-next-line import/no-extraneous-dependencies
const aws_sdk_1 = require("aws-sdk");
const s3 = new aws_sdk_1.S3();
async function handler(event) {
    var _a;
    switch (event.RequestType) {
        case 'Create':
            return;
        case 'Update':
            return onUpdate(event);
        case 'Delete':
            return onDelete((_a = event.ResourceProperties) === null || _a === void 0 ? void 0 : _a.BucketName);
    }
}
exports.handler = handler;
async function onUpdate(event) {
    var _a, _b;
    const updateEvent = event;
    const oldBucketName = (_a = updateEvent.OldResourceProperties) === null || _a === void 0 ? void 0 : _a.BucketName;
    const newBucketName = (_b = updateEvent.ResourceProperties) === null || _b === void 0 ? void 0 : _b.BucketName;
    const bucketNameHasChanged = newBucketName != null && oldBucketName != null && newBucketName !== oldBucketName;
    /* If the name of the bucket has changed, CloudFormation will try to delete the bucket
       and create a new one with the new name. So we have to delete the contents of the
       bucket so that this operation does not fail. */
    if (bucketNameHasChanged) {
        return onDelete(oldBucketName);
    }
}
/**
 * Recursively delete all items in the bucket
 *
 * @param bucketName the bucket name
 */
async function emptyBucket(bucketName) {
    var _a, _b;
    const listedObjects = await s3.listObjectVersions({ Bucket: bucketName }).promise();
    const contents = [...(_a = listedObjects.Versions) !== null && _a !== void 0 ? _a : [], ...(_b = listedObjects.DeleteMarkers) !== null && _b !== void 0 ? _b : []];
    if (contents.length === 0) {
        return;
    }
    const records = contents.map((record) => ({ Key: record.Key, VersionId: record.VersionId }));
    await s3.deleteObjects({ Bucket: bucketName, Delete: { Objects: records } }).promise();
    if (listedObjects === null || listedObjects === void 0 ? void 0 : listedObjects.IsTruncated) {
        await emptyBucket(bucketName);
    }
}
async function onDelete(bucketName) {
    if (!bucketName) {
        throw new Error('No BucketName was provided.');
    }
    await emptyBucket(bucketName);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBNkQ7QUFDN0QscUNBQTZCO0FBRTdCLE1BQU0sRUFBRSxHQUFHLElBQUksWUFBRSxFQUFFLENBQUM7QUFFYixLQUFLLFVBQVUsT0FBTyxDQUFDLEtBQWtEOztJQUM5RSxRQUFRLEtBQUssQ0FBQyxXQUFXLEVBQUU7UUFDekIsS0FBSyxRQUFRO1lBQ1gsT0FBTztRQUNULEtBQUssUUFBUTtZQUNYLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLEtBQUssUUFBUTtZQUNYLE9BQU8sUUFBUSxPQUFDLEtBQUssQ0FBQyxrQkFBa0IsMENBQUUsVUFBVSxDQUFDLENBQUM7S0FDekQ7QUFDSCxDQUFDO0FBVEQsMEJBU0M7QUFFRCxLQUFLLFVBQVUsUUFBUSxDQUFDLEtBQWtEOztJQUN4RSxNQUFNLFdBQVcsR0FBRyxLQUEwRCxDQUFDO0lBQy9FLE1BQU0sYUFBYSxTQUFHLFdBQVcsQ0FBQyxxQkFBcUIsMENBQUUsVUFBVSxDQUFDO0lBQ3BFLE1BQU0sYUFBYSxTQUFHLFdBQVcsQ0FBQyxrQkFBa0IsMENBQUUsVUFBVSxDQUFDO0lBQ2pFLE1BQU0sb0JBQW9CLEdBQUcsYUFBYSxJQUFJLElBQUksSUFBSSxhQUFhLElBQUksSUFBSSxJQUFJLGFBQWEsS0FBSyxhQUFhLENBQUM7SUFFL0c7O3NEQUVrRDtJQUNsRCxJQUFJLG9CQUFvQixFQUFFO1FBQ3hCLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ2hDO0FBQ0gsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxLQUFLLFVBQVUsV0FBVyxDQUFDLFVBQWtCOztJQUMzQyxNQUFNLGFBQWEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BGLE1BQU0sUUFBUSxHQUFHLENBQUMsU0FBRyxhQUFhLENBQUMsUUFBUSxtQ0FBSSxFQUFFLEVBQUUsU0FBRyxhQUFhLENBQUMsYUFBYSxtQ0FBSSxFQUFFLENBQUMsQ0FBQztJQUN6RixJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3pCLE9BQU87S0FDUjtJQUVELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNsRyxNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFdkYsSUFBSSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsV0FBVyxFQUFFO1FBQzlCLE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQy9CO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxRQUFRLENBQUMsVUFBbUI7SUFDekMsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztLQUNoRDtJQUNELE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBTMyB9IGZyb20gJ2F3cy1zZGsnO1xuXG5jb25zdCBzMyA9IG5ldyBTMygpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihldmVudDogQVdTTGFtYmRhLkNsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VFdmVudCkge1xuICBzd2l0Y2ggKGV2ZW50LlJlcXVlc3RUeXBlKSB7XG4gICAgY2FzZSAnQ3JlYXRlJzpcbiAgICAgIHJldHVybjtcbiAgICBjYXNlICdVcGRhdGUnOlxuICAgICAgcmV0dXJuIG9uVXBkYXRlKGV2ZW50KTtcbiAgICBjYXNlICdEZWxldGUnOlxuICAgICAgcmV0dXJuIG9uRGVsZXRlKGV2ZW50LlJlc291cmNlUHJvcGVydGllcz8uQnVja2V0TmFtZSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb25VcGRhdGUoZXZlbnQ6IEFXU0xhbWJkYS5DbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRXZlbnQpIHtcbiAgY29uc3QgdXBkYXRlRXZlbnQgPSBldmVudCBhcyBBV1NMYW1iZGEuQ2xvdWRGb3JtYXRpb25DdXN0b21SZXNvdXJjZVVwZGF0ZUV2ZW50O1xuICBjb25zdCBvbGRCdWNrZXROYW1lID0gdXBkYXRlRXZlbnQuT2xkUmVzb3VyY2VQcm9wZXJ0aWVzPy5CdWNrZXROYW1lO1xuICBjb25zdCBuZXdCdWNrZXROYW1lID0gdXBkYXRlRXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzPy5CdWNrZXROYW1lO1xuICBjb25zdCBidWNrZXROYW1lSGFzQ2hhbmdlZCA9IG5ld0J1Y2tldE5hbWUgIT0gbnVsbCAmJiBvbGRCdWNrZXROYW1lICE9IG51bGwgJiYgbmV3QnVja2V0TmFtZSAhPT0gb2xkQnVja2V0TmFtZTtcblxuICAvKiBJZiB0aGUgbmFtZSBvZiB0aGUgYnVja2V0IGhhcyBjaGFuZ2VkLCBDbG91ZEZvcm1hdGlvbiB3aWxsIHRyeSB0byBkZWxldGUgdGhlIGJ1Y2tldFxuICAgICBhbmQgY3JlYXRlIGEgbmV3IG9uZSB3aXRoIHRoZSBuZXcgbmFtZS4gU28gd2UgaGF2ZSB0byBkZWxldGUgdGhlIGNvbnRlbnRzIG9mIHRoZVxuICAgICBidWNrZXQgc28gdGhhdCB0aGlzIG9wZXJhdGlvbiBkb2VzIG5vdCBmYWlsLiAqL1xuICBpZiAoYnVja2V0TmFtZUhhc0NoYW5nZWQpIHtcbiAgICByZXR1cm4gb25EZWxldGUob2xkQnVja2V0TmFtZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBkZWxldGUgYWxsIGl0ZW1zIGluIHRoZSBidWNrZXRcbiAqXG4gKiBAcGFyYW0gYnVja2V0TmFtZSB0aGUgYnVja2V0IG5hbWVcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZW1wdHlCdWNrZXQoYnVja2V0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGxpc3RlZE9iamVjdHMgPSBhd2FpdCBzMy5saXN0T2JqZWN0VmVyc2lvbnMoeyBCdWNrZXQ6IGJ1Y2tldE5hbWUgfSkucHJvbWlzZSgpO1xuICBjb25zdCBjb250ZW50cyA9IFsuLi5saXN0ZWRPYmplY3RzLlZlcnNpb25zID8/IFtdLCAuLi5saXN0ZWRPYmplY3RzLkRlbGV0ZU1hcmtlcnMgPz8gW11dO1xuICBpZiAoY29udGVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgcmVjb3JkcyA9IGNvbnRlbnRzLm1hcCgocmVjb3JkOiBhbnkpID0+ICh7IEtleTogcmVjb3JkLktleSwgVmVyc2lvbklkOiByZWNvcmQuVmVyc2lvbklkIH0pKTtcbiAgYXdhaXQgczMuZGVsZXRlT2JqZWN0cyh7IEJ1Y2tldDogYnVja2V0TmFtZSwgRGVsZXRlOiB7IE9iamVjdHM6IHJlY29yZHMgfSB9KS5wcm9taXNlKCk7XG5cbiAgaWYgKGxpc3RlZE9iamVjdHM/LklzVHJ1bmNhdGVkKSB7XG4gICAgYXdhaXQgZW1wdHlCdWNrZXQoYnVja2V0TmFtZSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb25EZWxldGUoYnVja2V0TmFtZT86IHN0cmluZykge1xuICBpZiAoIWJ1Y2tldE5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIEJ1Y2tldE5hbWUgd2FzIHByb3ZpZGVkLicpO1xuICB9XG4gIGF3YWl0IGVtcHR5QnVja2V0KGJ1Y2tldE5hbWUpO1xufVxuIl19