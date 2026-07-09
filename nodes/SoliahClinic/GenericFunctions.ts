import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

async function getBaseUrl(this: IExecuteFunctions | ILoadOptionsFunctions): Promise<string> {
	const credentials = await this.getCredentials('soliahClinicApi');
	const baseUrl = ((credentials.baseUrl as string) || 'https://api.soliahclinic.com').replace(/\/+$/, '');
	return baseUrl;
}

export async function soliahApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const baseUrl = await getBaseUrl.call(this);
	const options: {
		method: IHttpRequestMethods;
		url: string;
		qs: IDataObject;
		body?: IDataObject;
		json: boolean;
	} = {
		method,
		url: `${baseUrl}/api/integrations/crm${endpoint}`,
		qs,
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'soliahClinicApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function soliahApiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	qs: IDataObject = {},
): Promise<any[]> {
	const returnData: any[] = [];
	const perPage = 100;
	const maxPages = 100;
	let page = 1;

	do {
		const response = await soliahApiRequest.call(this, method, endpoint, {}, { ...qs, page, per_page: perPage });
		const items = response.data;
		if (!items || !Array.isArray(items)) {
			break;
		}
		returnData.push(...items);
		if (!response.has_more || page >= maxPages) {
			break;
		}
		page++;
	} while (true);

	return returnData;
}

export function cleanData(data: IDataObject): IDataObject {
	const cleaned: IDataObject = {};
	for (const key of Object.keys(data)) {
		const value = data[key];
		if (value === null || value === undefined || value === '') {
			continue;
		}
		if (Array.isArray(value)) {
			if (value.length === 0) continue;
			cleaned[key] = value;
			continue;
		}
		cleaned[key] = value;
	}
	return cleaned;
}
