import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SoliahClinicApi implements ICredentialType {
	name = 'soliahClinicApi';
	displayName = 'Soliah Clinic API';
	documentationUrl = 'https://soliahclinic.com';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Personal Access Token gerado em Configurações > Integrações > Tokens de API (formato sk_soliah_...).',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.soliahclinic.com',
			description: 'URL base da API do Soliah. Padrão: produção.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/integrations/crm/pipelines',
			method: 'GET',
		},
	};
}
