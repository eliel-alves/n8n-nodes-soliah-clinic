import { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['tag'] } },
		options: [
			{ name: 'Associar', value: 'attach', description: 'Associa uma tag a uma negociação', action: 'Associar tag' },
			{ name: 'Desassociar', value: 'detach', description: 'Remove uma tag de uma negociação', action: 'Desassociar tag' },
		],
		default: 'attach',
	},
];

export const tagFields: INodeProperties[] = [
	{
		displayName: 'ID Da Negociação',
		name: 'dealId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['tag'], operation: ['attach', 'detach'] } },
		default: '',
	},
	{
		displayName: 'ID Da Tag',
		name: 'tagId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['tag'], operation: ['attach', 'detach'] } },
		default: '',
		description: 'UUID da tag da organização',
	},
];
