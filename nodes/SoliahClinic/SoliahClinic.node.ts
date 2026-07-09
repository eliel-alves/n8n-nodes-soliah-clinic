import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { soliahApiRequest, soliahApiRequestAllItems, cleanData } from './GenericFunctions';
import { dealOperations, dealFields } from './descriptions/DealDescription';
import { activityOperations, activityFields } from './descriptions/ActivityDescription';
import { tagOperations, tagFields } from './descriptions/TagDescription';

export class SoliahClinic implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Soliah Clinic',
		name: 'soliahClinic',
		icon: 'file:soliah-logo.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Gerencie o CRM do Soliah Clinic',
		defaults: { name: 'Soliah Clinic' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'soliahClinicApi', required: true }],
		properties: [
			{
				displayName: 'Recurso',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Negociação', value: 'deal' },
					{ name: 'Atividade', value: 'activity' },
					{ name: 'Tag', value: 'tag' },
				],
				default: 'deal',
			},
			...dealOperations,
			...dealFields,
			...activityOperations,
			...activityFields,
			...tagOperations,
			...tagFields,
		],
	};

	methods = {
		loadOptions: {
			async getPipelines(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await soliahApiRequest.call(this, 'GET', '/pipelines');
				return ((response.data ?? []) as IDataObject[]).map((p) => ({
					name: p.name as string,
					value: p.id as string,
				}));
			},
			async getStages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const pipelineId = this.getCurrentNodeParameter('pipeline_id') as string;
				if (!pipelineId) return [];
				const response = await soliahApiRequest.call(this, 'GET', `/pipelines/${pipelineId}/stages`);
				return ((response.data ?? []) as IDataObject[]).map((s) => ({
					name: s.name as string,
					value: s.id as string,
				}));
			},
			async getOwners(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await soliahApiRequest.call(this, 'GET', '/owners');
				return ((response.data ?? []) as IDataObject[]).map((o) => ({
					name: (o.full_name as string) ?? (o.id as string),
					value: o.id as string,
				}));
			},
			async getServices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await soliahApiRequest.call(this, 'GET', '/services');
				return ((response.data ?? []) as IDataObject[]).map((s) => ({
					name: s.name as string,
					value: s.id as string,
				}));
			},
			async getLossReasons(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await soliahApiRequest.call(this, 'GET', '/loss-reasons');
				return ((response.data ?? []) as IDataObject[]).map((r) => ({
					name: r.name as string,
					value: r.id as string,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				if (resource === 'deal') {
					if (operation === 'create') {
						const body: IDataObject = cleanData({
							title: this.getNodeParameter('title', i) as string,
							lead_name: this.getNodeParameter('lead_name', i) as string,
							pipeline_id: this.getNodeParameter('pipeline_id', i) as string,
							stage_id: this.getNodeParameter('stage_id', i) as string,
							...(this.getNodeParameter('additionalFields', i, {}) as IDataObject),
						});
						const response = await soliahApiRequest.call(this, 'POST', '/deals', body);
						responseData = response.data ?? response;
					} else if (operation === 'get') {
						const dealId = this.getNodeParameter('dealId', i) as string;
						const response = await soliahApiRequest.call(this, 'GET', `/deals/${dealId}`);
						responseData = response.data ?? response;
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						if (returnAll) {
							responseData = await soliahApiRequestAllItems.call(this, 'GET', '/deals', cleanData(filters));
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = await soliahApiRequest.call(this, 'GET', '/deals', {}, { ...cleanData(filters), per_page: limit, page: 1 });
							responseData = response.data ?? [];
						}
					} else if (operation === 'update') {
						const dealId = this.getNodeParameter('dealId', i) as string;
						const stageId = this.getNodeParameter('stage_id', i, '') as string;
						const body: IDataObject = cleanData({
							...(stageId ? { stage_id: stageId } : {}),
							...(this.getNodeParameter('updateFields', i, {}) as IDataObject),
						});
						const response = await soliahApiRequest.call(this, 'PATCH', `/deals/${dealId}`, body);
						responseData = response.data ?? response;
					} else if (operation === 'delete') {
						const dealId = this.getNodeParameter('dealId', i) as string;
						await soliahApiRequest.call(this, 'DELETE', `/deals/${dealId}`);
						responseData = { success: true, id: dealId };
					}
				} else if (resource === 'activity') {
					if (operation === 'create') {
						const dealId = this.getNodeParameter('dealId', i) as string;
						const body: IDataObject = cleanData({
							activity_type: this.getNodeParameter('activity_type', i) as string,
							title: this.getNodeParameter('title', i) as string,
							due_at: this.getNodeParameter('due_at', i, '') as string,
							...(this.getNodeParameter('activityAdditionalFields', i, {}) as IDataObject),
						});
						const response = await soliahApiRequest.call(this, 'POST', `/deals/${dealId}/activities`, body);
						responseData = response.data ?? response;
					} else if (operation === 'getAll') {
						const dealId = this.getNodeParameter('dealId', i) as string;
						const response = await soliahApiRequest.call(this, 'GET', `/deals/${dealId}/activities`);
						responseData = response.data ?? [];
					} else if (operation === 'update') {
						const activityId = this.getNodeParameter('activityId', i) as string;
						const body: IDataObject = cleanData(this.getNodeParameter('activityUpdateFields', i, {}) as IDataObject);
						const response = await soliahApiRequest.call(this, 'PATCH', `/activities/${activityId}`, body);
						responseData = response.data ?? response;
					} else if (operation === 'setStatus') {
						const activityId = this.getNodeParameter('activityId', i) as string;
						const completed = this.getNodeParameter('completed', i) as boolean;
						const response = await soliahApiRequest.call(this, 'POST', `/activities/${activityId}/status`, { completed });
						responseData = response.data ?? response;
					}
				} else if (resource === 'tag') {
					const dealId = this.getNodeParameter('dealId', i) as string;
					const tagId = this.getNodeParameter('tagId', i) as string;
					if (operation === 'attach') {
						responseData = await soliahApiRequest.call(this, 'POST', `/deals/${dealId}/tags`, { tagId });
					} else if (operation === 'detach') {
						await soliahApiRequest.call(this, 'DELETE', `/deals/${dealId}/tags/${tagId}`);
						responseData = { success: true, dealId, tagId };
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(Array.isArray(responseData) ? responseData : [responseData]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
